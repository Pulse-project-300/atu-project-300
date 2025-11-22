FROM python:3.11

WORKDIR /app

# Install Python dependencies
COPY services/ai-orchestrator/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Source is mounted during dev
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
