# Experimental Features

This folder contains experimental and proof-of-concept implementations that are not part of the core production pipeline.

## 🧪 Contents

### Advanced Machine Learning
- **`advanced_model.py`** - PyTorch-based neural network for ESG risk prediction
- **`advanced_train_pipeline.py`** - Training pipeline for the PyTorch model
- **`hyperparameter_tuning.py`** - Optuna-based hyperparameter optimization

### AI Agents & Intelligence
- **`agentic_pipeline.py`** - Multi-agent AI system for ESG analysis
- **`integrated_intelligence.py`** - Combines news analysis with AI agents
- **`news_api.py`** - News sentiment analysis and ESG risk detection

## ⚠️ Status

These files are **experimental** and may:
- Require additional dependencies not in main `requirements.txt`
- Have incomplete documentation
- Not be production-ready
- Depend on external API keys (OpenAI, Anthropic, News APIs)

## 🚀 Usage

To use these experimental features:

1. Install additional dependencies:
   ```bash
   pip install torch optuna openai anthropic newsapi-python
   ```

2. Set up required API keys in `.env`:
   ```bash
   OPENAI_API_KEY=your_key
   ANTHROPIC_API_KEY=your_key
   NEWSAPI_KEY=your_key
   ```

3. Run the scripts from the project root:
   ```bash
   python scripts/experimental/advanced_train_pipeline.py
   ```

## 📝 Notes

- The production system uses the scikit-learn based `train_pipeline.py` in the parent directory
- These experimental features may be integrated into the main codebase in future versions
- For production deployments, use the core scripts in the parent `scripts/` folder
