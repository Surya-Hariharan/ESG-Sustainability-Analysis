import optuna
from optuna.integration import TensorBoardCallback
import torch
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from pathlib import Path
import json
from torch.utils.data import DataLoader, SubsetRandomSampler
from typing import Dict
from advanced_model import ESGRiskModel, ESGDataset, ModelTrainer


class HyperparameterOptimizer:
    def __init__(
        self,
        X: np.ndarray,
        y: np.ndarray,
        n_trials: int = 50,
        cv_folds: int = 5,
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    ):
        self.X = X
        self.y = y
        self.n_trials = n_trials
        self.cv_folds = cv_folds
        self.device = device
        self.best_params = None
        self.study = None
    
    def objective(self, trial: optuna.Trial) -> float:
        hidden_dim_1 = trial.suggest_int('hidden_dim_1', 64, 256, step=32)
        hidden_dim_2 = trial.suggest_int('hidden_dim_2', 128, 512, step=64)
        hidden_dim_3 = trial.suggest_int('hidden_dim_3', 64, 256, step=32)
        projection_dim = trial.suggest_int('projection_dim', 32, 128, step=16)
        dropout = trial.suggest_float('dropout', 0.2, 0.5)
        learning_rate = trial.suggest_float('learning_rate', 1e-5, 1e-2, log=True)
        weight_decay = trial.suggest_float('weight_decay', 1e-6, 1e-3, log=True)
        batch_size = trial.suggest_categorical('batch_size', [32, 64, 128])
        
        fold_scores = []
        skf = StratifiedKFold(n_splits=self.cv_folds, shuffle=True, random_state=42)
        
        for fold, (train_idx, val_idx) in enumerate(skf.split(self.X, self.y)):
            scaler = StandardScaler()
            X_train_fold = scaler.fit_transform(self.X[train_idx])
            X_val_fold = scaler.transform(self.X[val_idx])
            
            train_dataset = ESGDataset(X_train_fold, self.y[train_idx])
            val_dataset = ESGDataset(X_val_fold, self.y[val_idx])
            
            train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
            val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
            
            model = ESGRiskModel(
                input_dim=self.X.shape[1],
                hidden_dims=(hidden_dim_1, hidden_dim_2, hidden_dim_3),
                projection_dim=projection_dim,
                num_classes=len(np.unique(self.y)),
                dropout=dropout
            )
            
            class_counts = np.bincount(self.y[train_idx])
            class_weights = 1.0 / (class_counts / class_counts.sum())
            
            trainer = ModelTrainer(
                model=model,
                train_loader=train_loader,
                val_loader=val_loader,
                device=self.device,
                learning_rate=learning_rate,
                weight_decay=weight_decay,
                class_weights=class_weights,
                log_dir=f'runs/optuna_trial_{trial.number}_fold_{fold}'
            )
            
            history = trainer.train(
                num_epochs=30,
                save_path=Path(f'models/temp_trial_{trial.number}_fold_{fold}.pth')
            )
            
            fold_scores.append(max(history['val_f1']))
            
            trial.report(np.mean(fold_scores), fold)
            if trial.should_prune():
                raise optuna.TrialPruned()
        
        return np.mean(fold_scores)
    
    def optimize(self, study_name: str = 'esg_optimization') -> Dict:
        tensorboard_callback = TensorBoardCallback('runs/optuna/', metric_name='f1_score')
        
        self.study = optuna.create_study(
            study_name=study_name,
            direction='maximize',
            pruner=optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=10)
        )
        
        self.study.optimize(
            self.objective,
            n_trials=self.n_trials,
            callbacks=[tensorboard_callback],
            show_progress_bar=True
        )
        
        self.best_params = self.study.best_params
        
        print(f"\n{'='*60}")
        print(f"Best Trial: {self.study.best_trial.number}")
        print(f"Best F1 Score: {self.study.best_value:.4f}")
        print(f"Best Hyperparameters:")
        for key, value in self.best_params.items():
            print(f"  {key}: {value}")
        print(f"{'='*60}\n")
        
        return self.best_params
    
    def save_results(self, output_path: Path):
        results = {
            'best_params': self.best_params,
            'best_value': self.study.best_value,
            'n_trials': self.n_trials,
            'all_trials': [
                {
                    'number': trial.number,
                    'value': trial.value,
                    'params': trial.params,
                    'state': trial.state.name
                }
                for trial in self.study.trials
            ]
        }
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"✅ Saved optimization results to {output_path}")
        
        fig = optuna.visualization.plot_optimization_history(self.study)
        fig.write_html(output_path.parent / 'optimization_history.html')
        
        fig = optuna.visualization.plot_param_importances(self.study)
        fig.write_html(output_path.parent / 'param_importances.html')
        
        fig = optuna.visualization.plot_parallel_coordinate(self.study)
        fig.write_html(output_path.parent / 'parallel_coordinate.html')


if __name__ == '__main__':
    import pandas as pd
    from sklearn.model_selection import train_test_split
    
    df = pd.read_csv('../data/processed/esg_data_cleaned.csv')
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
    
    optimizer = HyperparameterOptimizer(X_temp, y_temp, n_trials=50)
    best_params = optimizer.optimize()
    optimizer.save_results(Path('../models/hyperparameter_optimization.json'))
