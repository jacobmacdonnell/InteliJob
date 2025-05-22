# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# We run this separately to leverage Docker cache
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy the rest of the backend application code into the container at /app
COPY . .

# Make port 8000 available to the world outside this container
# This will be overridden by the PORT environment variable if set
EXPOSE 8000

# Define environment variable for production
ENV ENVIRONMENT=production
ENV PYTHONUNBUFFERED=1 

# Run start.py when the container launches
# The start.py script will use WEB_CONCURRENCY for Gunicorn workers in production
CMD ["python", "start.py"] 