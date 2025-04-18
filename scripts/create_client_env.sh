#!/bin/bash

echo "Generating client .env file..."
echo "Please provide the following information:"

# Prompt for database information
read -p "Enter database username: " db_username
read -s -p "Enter database password: " db_password
echo
read -s -p "Confirm database password: " db_password_confirm
echo

# Check if passwords match
while [ "$db_password" != "$db_password_confirm" ]; do
  echo "Passwords do not match. Please try again."
  read -s -p "Enter database password: " db_password
  echo
  read -s -p "Confirm database password: " db_password_confirm
  echo
done

read -p "Enter database host (default: localhost): " db_host
db_host=${db_host:-localhost}
read -p "Enter database port (default: 5432): " db_port
db_port=${db_port:-5432}
read -p "Enter database name: " db_name

# Prompt for security settings
read -p "Enter salt rounds (default: 10): " salt_rounds
salt_rounds=${salt_rounds:-10}
# Generate a random JWT secret if not provided
read -p "Enter JWT secret (leave blank to generate): " jwt_secret
if [ -z "$jwt_secret" ]; then
  jwt_secret=$(openssl rand -base64 32)
fi

# Prompt for project information
read -p "Enter project name (default: Prototype): " project_name
project_name=${project_name:-Prototype}
read -p "Enter chatbot name (default: ${project_name} AI): " chatbot_name
chatbot_name=${chatbot_name:-"${project_name} AI"}

# Prompt for client URL
read -p "Enter client URL (default: http://localhost:3000): " client_url
client_url=${client_url:-http://localhost:3000}

# Prompt for prompt generation URL
read -p "Enter prompt generation URL (default: http://localhost:5000/api/chat/generate-prompt): " prompt_generation_url
prompt_generation_url=${prompt_generation_url:-"http://localhost:5000/api/chat/generate-prompt"}

# Prompt for API key
read -p "Enter API key (default: sunshine-lollipops-gummybears-teardrops): " api_key
api_key=${api_key:-"sunshine-lollipops-gummybears-teardrops"}

# Create the .env file
cat > client/.env << EOF
DATABASE_URL="postgresql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}"
SALT_ROUNDS=${salt_rounds}
JWT_SECRET="${jwt_secret}"

NEXT_PUBLIC_PROJECT_NAME="${project_name}"
NEXT_PUBLIC_CHATBOT_NAME="${chatbot_name}"

NEXT_PUBLIC_CLIENT_URL="${client_url}"
NEXT_PUBLIC_PROMPT_GENERATION_URL="${prompt_generation_url}"

API_KEY='${api_key}'
EOF

echo "Client .env file has been generated successfully!"
chmod +x scripts/generate_client_env.sh
