import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report
from torch.utils.data import DataLoader
import json
from datetime import datetime
from advanced_model import ESGRiskModel, ESGDataset, ModelTrainer
import joblib


class AdvancedTrainingPipeline:
    def __init__(self, data_path: Path, output_dir: Path):
        self.data_path = data_path
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.model = None
        self.scaler = None
        self.history = None
        self.test_results = None
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        print(f"🚀 Using device: {self.device}")
    
    def load_and_preprocess_data(self):
        df = pd.read_csv(self.data_path)
        if hasattr(df.columns, 'str'):
            df.columns = df.columns.str.strip()
        
        feature_cols = ['Environment Risk Score', 'Social Risk Score', 
                       'Governance Risk Score', 'Controversy Score']
        
        X = df[feature_cols].fillna(df[feature_cols].median()).values
        X = np.column_stack([X, np.ones((X.shape[0], 1)) * 1000])
        
        y = df['ESG Risk Level'].fillna('Medium').map({'Low': 0, 'Medium': 1, 'High': 2}).values
        
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=0.15, stratify=y, random_state=42
        )
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=0.15, stratify=y_temp, random_state=42
        )
        
        self.scaler = StandardScaler()
        X_train = self.scaler.fit_transform(X_train)
        X_val = self.scaler.transform(X_val)
        X_test = self.scaler.transform(X_test)
        
        print(f"✅ Data loaded: Train={X_train.shape}, Val={X_val.shape}, Test={X_test.shape}")
        print(f"Class distribution: {np.bincount(y)}")
        
        return (X_train, y_train), (X_val, y_val), (X_test, y_test)
    
    def create_dataloaders(self, train_data, val_data, batch_size=64):
        train_dataset = ESGDataset(*train_data)
        val_dataset = ESGDataset(*val_data)
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
        
        return train_loader, val_loader
    
    def train_model(self, train_loader, val_loader, config: dict):
        class_counts = np.bincount(train_loader.dataset.labels.numpy())
        class_weights = 1.0 / (class_counts / class_counts.sum())
        
        self.model = ESGRiskModel(
            input_dim=5,
            hidden_dims=tuple(config.get('hidden_dims', [128, 256, 128])),
            projection_dim=config.get('projection_dim', 64),
            num_classes=3,
            dropout=config.get('dropout', 0.3)
        )
        
        trainer = ModelTrainer(
            model=self.model,
            train_loader=train_loader,
            val_loader=val_loader,
            device=self.device,
            learning_rate=config.get('learning_rate', 1e-3),
            weight_decay=config.get('weight_decay', 1e-4),
            class_weights=class_weights,
            log_dir=str(self.output_dir / 'tensorboard_logs')
        )
        
        self.history = trainer.train(
            num_epochs=config.get('num_epochs', 100),
            save_path=self.output_dir / 'best_model.pth'
        )
        
        return self.history
    
    def evaluate_model(self, test_data):
        test_dataset = ESGDataset(*test_data)
        test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)
        
        self.model.eval()
        all_preds, all_labels, all_probs = [], [], []
        
        with torch.no_grad():
            for features, labels in test_loader:
                features = features.to(self.device)
                logits = self.model(features)
                probs = torch.softmax(logits, dim=1)
                preds = torch.argmax(logits, dim=1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.numpy())
                all_probs.extend(probs.cpu().numpy())
        
        self.test_results = {
            'predictions': all_preds,
            'labels': all_labels,
            'probabilities': all_probs,
            'classification_report': classification_report(all_labels, all_preds, 
                                                          target_names=['Low', 'Medium', 'High'],
                                                          output_dict=True)
        }
        
        print("\n" + "="*60)
        print("TEST SET EVALUATION")
        print("="*60)
        print(classification_report(all_labels, all_preds, target_names=['Low', 'Medium', 'High']))
        
        return self.test_results
    
    def plot_training_curves(self):
        fig, axes = plt.subplots(1, 3, figsize=(18, 5))
        
        epochs = range(1, len(self.history['train_loss']) + 1)
        
        axes[0].plot(epochs, self.history['train_loss'], 'b-', label='Train Loss', linewidth=2)
        axes[0].plot(epochs, self.history['val_loss'], 'r-', label='Val Loss', linewidth=2)
        axes[0].set_xlabel('Epoch', fontsize=12)
        axes[0].set_ylabel('Loss', fontsize=12)
        axes[0].set_title('Training and Validation Loss', fontsize=14, fontweight='bold')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        axes[1].plot(epochs, self.history['train_acc'], 'b-', label='Train Accuracy', linewidth=2)
        axes[1].plot(epochs, self.history['val_acc'], 'r-', label='Val Accuracy', linewidth=2)
        axes[1].set_xlabel('Epoch', fontsize=12)
        axes[1].set_ylabel('Accuracy', fontsize=12)
        axes[1].set_title('Training and Validation Accuracy', fontsize=14, fontweight='bold')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        
        axes[2].plot(epochs, self.history['train_f1'], 'b-', label='Train F1', linewidth=2)
        axes[2].plot(epochs, self.history['val_f1'], 'r-', label='Val F1', linewidth=2)
        axes[2].set_xlabel('Epoch', fontsize=12)
        axes[2].set_ylabel('F1 Score', fontsize=12)
        axes[2].set_title('Training and Validation F1 Score', fontsize=14, fontweight='bold')
        axes[2].legend()
        axes[2].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'training_curves.png', dpi=300, bbox_inches='tight')
        print(f"✅ Saved training curves to {self.output_dir / 'training_curves.png'}")
        plt.close()
    
    def plot_confusion_matrix(self):
        cm = confusion_matrix(self.test_results['labels'], self.test_results['predictions'])
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Low', 'Medium', 'High'],
                   yticklabels=['Low', 'Medium', 'High'],
                   cbar_kws={'label': 'Count'})
        plt.xlabel('Predicted Risk Level', fontsize=12)
        plt.ylabel('True Risk Level', fontsize=12)
        plt.title('Confusion Matrix - Test Set', fontsize=14, fontweight='bold')
        plt.tight_layout()
        plt.savefig(self.output_dir / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
        print(f"✅ Saved confusion matrix to {self.output_dir / 'confusion_matrix.png'}")
        plt.close()
    
    def plot_per_class_metrics(self):
        report = self.test_results['classification_report']
        classes = ['Low', 'Medium', 'High']
        metrics = ['precision', 'recall', 'f1-score']
        
        data = [[report[cls][metric] for metric in metrics] for cls in classes]
        
        fig, ax = plt.subplots(figsize=(10, 6))
        x = np.arange(len(classes))
        width = 0.25
        
        for i, metric in enumerate(metrics):
            values = [data[j][i] for j in range(len(classes))]
            ax.bar(x + i * width, values, width, label=metric.capitalize())
        
        ax.set_xlabel('Risk Level', fontsize=12)
        ax.set_ylabel('Score', fontsize=12)
        ax.set_title('Per-Class Performance Metrics', fontsize=14, fontweight='bold')
        ax.set_xticks(x + width)
        ax.set_xticklabels(classes)
        ax.legend()
        ax.grid(True, alpha=0.3, axis='y')
        ax.set_ylim(0, 1.1)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'per_class_metrics.png', dpi=300, bbox_inches='tight')
        print(f"✅ Saved per-class metrics to {self.output_dir / 'per_class_metrics.png'}")
        plt.close()
    
    def save_artifacts(self):
        joblib.dump(self.scaler, self.output_dir / 'scaler.pkl')
        
        metadata = {
            'version': 2,
            'generated_at': datetime.now().isoformat(),
            'model_architecture': 'ESGRiskModel with ProjectionHead',
            'input_dim': 5,
            'num_classes': 3,
            'features': ['environment_risk_score', 'social_risk_score', 
                        'governance_risk_score', 'controversy_score', 'full_time_employees'],
            'classes': ['Low', 'Medium', 'High'],
            'device': self.device,
            'best_val_f1': max(self.history['val_f1']),
            'test_metrics': {
                'accuracy': self.test_results['classification_report']['accuracy'],
                'macro_f1': self.test_results['classification_report']['macro avg']['f1-score'],
                'weighted_f1': self.test_results['classification_report']['weighted avg']['f1-score']
            }
        }
        
        with open(self.output_dir / 'model_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Saved model artifacts to {self.output_dir}")
    
    def run_full_pipeline(self, config: dict):
        print("\n" + "="*60)
        print("ADVANCED ESG RISK PREDICTION TRAINING PIPELINE")
        print("="*60 + "\n")
        
        train_data, val_data, test_data = self.load_and_preprocess_data()
        train_loader, val_loader = self.create_dataloaders(train_data, val_data, 
                                                           config.get('batch_size', 64))
        
        print("\n🏋️ Starting model training...")
        self.train_model(train_loader, val_loader, config)
        
        print("\n📊 Evaluating on test set...")
        self.evaluate_model(test_data)
        
        print("\n📈 Generating visualizations...")
        self.plot_training_curves()
        self.plot_confusion_matrix()
        self.plot_per_class_metrics()
        
        print("\n💾 Saving artifacts...")
        self.save_artifacts()
        
        print("\n" + "="*60)
        print("✅ TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\nRun 'tensorboard --logdir {self.output_dir / 'tensorboard_logs'}' to view training metrics")


if __name__ == '__main__':
    config = {
        'hidden_dims': [128, 256, 128],
        'projection_dim': 64,
        'dropout': 0.3,
        'learning_rate': 1e-3,
        'weight_decay': 1e-4,
        'batch_size': 64,
        'num_epochs': 100
    }
    
    pipeline = AdvancedTrainingPipeline(
        data_path=Path('../data/processed/esg_data_cleaned.csv'),
        output_dir=Path('../models/advanced_model')
    )
    
    pipeline.run_full_pipeline(config)
