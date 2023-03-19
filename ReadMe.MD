# Visionary Fashion Bot

Visionary Fashion Bot is an AI-powered chatbot designed to help individuals with color blindness make confident and stylish choices in makeup and outfits. It utilizes the OpenAI ChatGPT API to generate personalized fashion and makeup advice tailored to users' specific color vision deficiencies. Additionally, the chatbot uses the Google Custom Search API to find and display relevant images based on the generated recommendations.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Deployment](#deployment)
4. [Contributing](#contributing)
5. [License](#license)

## Installation

Before you begin, make sure you have [Node.js](https://nodejs.org/en/download/) installed.

Clone the repository:

\`\`\`bash
git clone https://github.com/EziamakaNV/visionary-fashion-bot.git
\`\`\`

Navigate to the project directory:

\`\`\`bash
cd visionary-fashion-bot
\`\`\`

Install the dependencies:

\`\`\`bash
npm install
\`\`\`

## Usage

1. Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

TELEGRAM_TOKEN=<your_telegram_bot_token>
OPENAI_API_KEY=<your_openai_api_key>
GOOGLE_API_KEY=<your_google_api_key>
GOOGLE_CSE_ID=<your_google_cse_id>


2. Start the development server:

\`\`\`bash
npm run start:dev
\`\`\`

3. Interact with the chatbot through the Telegram app by searching for your bot's username and sending messages.

## Deployment

The project is deployed on AWS Elastic Beanstalk. To deploy the project, follow these steps:

1. Install the [AWS CLI](https://aws.amazon.com/cli/) and [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html).

2. Configure your AWS CLI:

\`\`\`bash
aws configure
\`\`\`

3. Initialize your Elastic Beanstalk environment:

\`\`\`bash
eb init -p node.js <your-application-name>
\`\`\`

4. Create the environment:

\`\`\`bash
eb create <your-environment-name>
\`\`\`

5. Deploy the application:

\`\`\`bash
eb deploy
\`\`\`

The `buildspec.yml` file in the project root directory contains the build configuration for AWS CodeBuild, which transpiles the code using Babel.

## Contributing

1. Fork the repository.
2. Create a new branch with a descriptive name.
3. Make changes or add new features.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the `LICENSE` file for details.
