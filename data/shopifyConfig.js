const fetch = require('node-fetch');
const Client= require('shopify-buy');

global.fetch = fetch;

const client = Client.buildClient({
  domain: process.env.ShopifyDomain,
  storefrontAccessToken: process.env.StorefrontAccessToken
});

module.exports.client = client;
