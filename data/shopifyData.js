const axios = require('axios');

class ShopifyData {

  async fetchProducts() {
    try {
      const response = await axios.get('http://localhost:3978/products');
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  async addToCart(id) {
    try {
      const response = await axios.post(`/add_line_item/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  // app.post('/add_line_item/:id', (req, res) => {
  //   const options = req.body;
  //   const productId = req.params.id;
  //   const checkoutId = options.checkoutId;
  //   const quantity = parseInt(options.quantity, 10);
  //   delete options.quantity;
  //   delete options.checkoutId;
  //   return productsPromise.then((products) => {
  //     const targetProduct = products.find((product) => {
  //       return product.id === productId;
  //     });
  //     // Find the corresponding variant
  //     const selectedVariant = client.product.helpers.variantForOptions(targetProduct, options);
  //     // Add the variant to our cart
  //     client.checkout.addLineItems(checkoutId, [{
  //       variantId: selectedVariant.id,
  //       quantity
  //     }]).then((checkout) => {
  //       res.redirect(`/?cart=true&checkoutId=${checkout.id}`);
  //     }).catch((err) => {
  //       return err;
  //     });
  //   });
  // });

  // app.post('/remove_line_item/:id', (req, res) => {
  //   const checkoutId = req.body.checkoutId;
  //   return client.checkout.removeLineItems(checkoutId, [req.params.id]).then((checkout) => {
  //     res.redirect(`/?cart=true&checkoutId=${checkout.id}`);
  //   });
  // });

  // app.post('/decrement_line_item/:id', (req, res) => {
  //   const checkoutId = req.body.checkoutId;
  //   const quantity = parseInt(req.body.currentQuantity, 10) - 1;
  //   return client.checkout.updateLineItems(checkoutId, [{
  //     id: req.params.id,
  //     quantity
  //   }]).then((checkout) => {
  //     res.redirect(`/?cart=true&checkoutId=${checkout.id}`);
  //   });
  // });

  // app.post('/increment_line_item/:id', (req, res) => {
  //   const checkoutId = req.body.checkoutId;
  //   const quantity = parseInt(req.body.currentQuantity, 10) + 1;
  //   return client.checkout.updateLineItems(checkoutId, [{
  //     id: req.params.id,
  //     quantity
  //   }]).then((checkout) => {
  //     res.redirect(`/?cart=true&checkoutId=${checkout.id}`);
  //   });
  // });
}

module.exports.ShopifyData = ShopifyData;

const sh = new ShopifyData()

sh.fetchProducts
