// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const corsMiddleware = require('restify-cors-middleware');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
    AutoSaveStateMiddleware,
    BotFrameworkAdapter,
    ConsoleTranscriptLogger,
    ConversationState,
    MemoryStorage,
    TranscriptLoggerMiddleware,
    UserState
} = require('botbuilder');

// This bot's main dialog.
const { WelcomeBot } = require('./bots/welcomeBot');
const { MainDialog, MAIN_WATERFALL_DIALOG } = require('./dialogs/mainDialog');


// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Create HTTP server
const app = express();

app.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\nExpress listening to ${process.env.Port}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo test your bot, see: https://aka.ms/debug-with-emulator`);
});

const stateStorage = new MemoryStorage();
const conversationState = new ConversationState(stateStorage);
const autoSaveState = new AutoSaveStateMiddleware(conversationState);
const userState = new UserState(stateStorage);
const logstore = new ConsoleTranscriptLogger();
const logActivity = new TranscriptLoggerMiddleware(logstore);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
})
    .use(autoSaveState); //, logActivity);

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.load(context);
    await conversationState.clear(context);
    // Save state changes.
    await conversationState.saveChanges(context);
};

// Create the main dialog.
const dialog = new MainDialog(MAIN_WATERFALL_DIALOG, conversationState, userState);
const bot = new WelcomeBot(conversationState, userState, dialog);

// Listen for incoming requests.
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);
    });
});

/**
 * Get Shopify Data
 */
const { client } = require('./data/shopifyConfig');

app.get('/products', async (req, res) => {
    await client.product.fetchAll().then((product) => {
        // Do something with the products
        res.send(JSON.stringify(product, 5, 2));
    });
})

app.post('/add_line_item/:id', (req, res) => {
    const options = req.body;
    const productId = req.params.id;
    const checkoutId = options.checkoutId;
    const quantity = parseInt(options.quantity, 10);
    delete options.quantity;
    delete options.checkoutId;
    return productsPromise.then((products) => {
        const targetProduct = products.find((product) => {
            return product.id === productId;
        });
        // Find the corresponding variant
        const selectedVariant = client.product.helpers.variantForOptions(targetProduct, options);
        // Add the variant to our cart
        client.checkout.addLineItems(checkoutId, [{
            variantId: selectedVariant.id,
            quantity
        }]).then((checkout) => {
            res.redirect(`/?cart=true&checkoutId=${checkout.id}`);
        }).catch((err) => {
            return err;
        });
    });
});


/**
 * Creates token server
 */
const cors = corsMiddleware({
    origins: ['*']
});
// Create HTTP server.
const dl_app = express();
dl_app.use(cors.preflight);
dl_app.use(cors.actual);
dl_app.use(bodyParser.json({
    extended: false
}));
dl_app.listen(process.env.dl_Port || process.env.DL_PORT || 3500, function () {
    console.log(`\nToken server listening to ${process.env.dl_Port}.`);
});
// Listen for incoming requests.
dl_app.post('/directline/token', (req, res) => {
    // userId must start with `dl_`
    const userId = (req.body && req.body.id) ? req.body.id : `dl_${Date.now() + Math.random().toString(36)}`;
    const options = {
        method: 'POST',
        uri: 'https://directline.botframework.com/v3/directline/tokens/generate',
        headers: {
            'Authorization': `Bearer ${process.env.DirectLineSecret}`
        },
        json: {
            User: {
                Id: userId
            }
        }
    };
    request.post(options, (error, response, body) => {
        if (!error && response.statusCode < 300) {
            res.send(body);
        } else {
            res.status(500).send('Call to retrieve token from DirectLine failed');
        }
    });
});
