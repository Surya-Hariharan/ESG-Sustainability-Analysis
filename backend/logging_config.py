"""Centralized logging configuration for ESG Sustainability Analysis."""
import logging
import os
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from datetime import datetime


class LogConfig:
    """Logging configuration manager."""

    def __init__(
        self,
        log_level: str = None,
        log_dir: str = "logs",
        app_name: str = "esg-app",
        enable_file_logging: bool = True,
        enable_console_logging: bool = True,
    ):
        """
        Initialize logging configuration.
        
        Args:
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            log_dir: Directory to store log files
            app_name: Application name for log files
            enable_file_logging: Whether to log to files
            enable_console_logging: Whether to log to console
        """
        self.log_level = log_level or os.getenv("LOG_LEVEL", "INFO")
        self.log_dir = Path(log_dir)
        self.app_name = app_name
        self.enable_file_logging = enable_file_logging
        self.enable_console_logging = enable_console_logging
        
        # Create log directory if it doesn't exist
        if self.enable_file_logging:
            self.log_dir.mkdir(exist_ok=True)
        
        self.setup_logging()

    def setup_logging(self):
        """Configure logging with handlers and formatters."""
        # Get root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, self.log_level.upper()))
        
        # Clear existing handlers
        root_logger.handlers.clear()
        
        # Create formatters
        detailed_formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        
        simple_formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        
        # Console handler
        if self.enable_console_logging:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(logging.INFO)
            console_handler.setFormatter(simple_formatter)
            root_logger.addHandler(console_handler)
        
        # File handlers
        if self.enable_file_logging:
            # General application log (rotating by size)
            app_log_file = self.log_dir / f"{self.app_name}.log"
            file_handler = RotatingFileHandler(
                app_log_file,
                maxBytes=10 * 1024 * 1024,  # 10 MB
                backupCount=5,
            )
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(detailed_formatter)
            root_logger.addHandler(file_handler)
            
            # Error log (rotating daily)
            error_log_file = self.log_dir / f"{self.app_name}-error.log"
            error_handler = TimedRotatingFileHandler(
                error_log_file,
                when="midnight",
                interval=1,
                backupCount=30,
            )
            error_handler.setLevel(logging.ERROR)
            error_handler.setFormatter(detailed_formatter)
            root_logger.addHandler(error_handler)
        
        # Log configuration
        logging.info(f"Logging configured: level={self.log_level}, file_logging={self.enable_file_logging}")

    @staticmethod
    def get_logger(name: str) -> logging.Logger:
        """
        Get a logger with the specified name.
        
        Args:
            name: Logger name (usually __name__)
        
        Returns:
            Configured logger instance
        """
        return logging.getLogger(name)


# Global configuration instance
_log_config = None


def configure_logging(**kwargs):
    """
    Configure application-wide logging.
    
    Keyword Args:
        log_level: Logging level
        log_dir: Directory for log files
        app_name: Application name
        enable_file_logging: Enable file logging
        enable_console_logging: Enable console logging
    """
    global _log_config
    _log_config = LogConfig(**kwargs)
    return _log_config


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance.
    
    Args:
        name: Logger name (usually __name__)
    
    Returns:
        Configured logger
    """
    # Initialize default config if not already done
    if _log_config is None:
        configure_logging()
    
    return logging.getLogger(name)


# Request logging middleware helper
def log_request(request_id: str, method: str, path: str, status_code: int, duration_ms: float):
    """
    Log HTTP request details.
    
    Args:
        request_id: Unique request identifier
        method: HTTP method
        path: Request path
        status_code: Response status code
        duration_ms: Request duration in milliseconds
    """
    logger = get_logger("http")
    logger.info(
        f"request_id={request_id} method={method} path={path} "
        f"status={status_code} duration={duration_ms:.2f}ms"
    )


# Example usage
if __name__ == "__main__":
    # Configure logging
    configure_logging(log_level="DEBUG", app_name="test-app")
    
    # Get logger
    logger = get_logger(__name__)
    
    # Test logging
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    logger.error("This is an error message")
    logger.critical("This is a critical message")
