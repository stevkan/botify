const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const { ShopifyData } = require('../data/shopifyData');

const DEMO_PRODUCTS = 'demoProducts';
const PRODUCTS_WATERFALL_DIALOG = 'productsWaterfallDialog'

class DemoProducts extends ComponentDialog {
  constructor() {
    super(DEMO_PRODUCTS)

    this.addDialog(new WaterfallDialog(PRODUCTS_WATERFALL_DIALOG, [
      this.listProducts.bind(this),
      this.finalStep.bind(this)
    ]));

    this.initialDialogId = PRODUCTS_WATERFALL_DIALOG;
    this.shopifyData = new ShopifyData();
  }

  async listProducts(innerDc) {
    const products = await this.shopifyData.fetchProducts()

    const productCard = [];
    const newProd = [];
    const finaleProd = [];
    (() => {
      for (const prod of products) {
        const prodId = prod.id;
        const prodCopy = JSON.parse(JSON.stringify(prod));
        const { variants, images, ...prodWithOutVariants } = prodCopy;
        const p = { ...prodWithOutVariants }
        for (const variant of variants) {
          variant.prodId = prodId;
          for (const image in images) {
            images[image].prodId = prodId;
            p['variant'] = variant;
            p['image'] = images[image];
            console.log(p)
            const card = CardFactory.adaptiveCard({
              "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
              "type": "AdaptiveCard",
              "version": "1.0",
              "body": [
                {
                  "type": "Container",
                  "style": "emphasis",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": `${p.title}`,
                      "weight": "Bolder",
                      "size": "Large"
                    },
                    {
                      "type": "Image",
                      "url": `${p.image.src}`,
                      "size": "stretch"
                    },
                    {
                      "type": "TextBlock",
                      "text": `Description: ${p.description}`,
                      "weight": "Normal",
                      "size": "Medium"
                    },
                    {
                      "type": "TextBlock",
                      "text": `Color: ${p.image.altText}`,
                      "weight": "Normal",
                      "size": "Medium"
                    },
                    {
                      "type": "TextBlock",
                      "text": 'Price: $' + `${p.variant.price}`,
                      "weight": "Normal",
                      "size": "Medium"
                    },
                    {
                      "type": "TextBlock",
                      "text": `Available: ${p.variant.available}`,
                      "weight": "Normal",
                      "size": "Small"
                    },
                    {
                      "type": "TextBlock",
                      "text": `Vendor: ${p.vendor}`,
                      "weight": "Normal",
                      "size": "Small"
                    },
                    {
                      "type": "TextBlock",
                      "text": `SKU: ${p.variant.sku}`,
                      "weight": "Normal",
                      "size": "Small"
                    },
                  ]
                }
              ],
              "actions": [
                {
                  "type": "Action.Submit",
                  "title": "Add to cart",
                  "data": {
                    "item": "cart_item_placeholder"
                  }
                }
              ]
            })
            productCard.push(card);
          }
          break;
        }
      }
    })()

    await innerDc.context.sendActivity({
      attachments: productCard,
      attachmentLayout: AttachmentLayoutTypes.Carousel
    });
    return await innerDc.next({ 'PROD': products });
  }

  async finalStep(innerDc) {
    return await innerDc.endDialog();
  }
}

module.exports.DemoProducts = DemoProducts;
module.exports.DEMO_PRODUCTS = DEMO_PRODUCTS;
