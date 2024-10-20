if (!customElements.get("custom-product-form")) {
    customElements.define("custom-product-form",
        class customProductForm extends HTMLElement {
            constructor() {
            super();
                this.form = this.querySelector('form');
                this.form.addEventListener('submit', this.addItemToCart.bind(this));
                this.submitBtn = this.querySelector('button');
                this.tags = this.submitBtn.getAttribute("data-tags");
                this.cart = document.querySelector('cart-drawer');
                this.VariantChange = document.querySelectorAll(".upsell-variant");
                this.VariantChange.forEach(element =>{
                    element.addEventListener('click',this.selectVariant.bind(this));
                });
            }

            addItemToCart(event) {
                event.preventDefault();
                let variantId = event.submitter.getAttribute("data-variant-id");
                this.submitBtn.setAttribute('disabled',true);
                let formData = {
                    'items': [{
                        'id': variantId,
                        'quantity': 1
                    }]
                };
                if (variantId && formData) {

                    fetch(window.Shopify.routes.root + 'cart/add.js', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    })
                        .then(response => {

                            return response.json();

                        }).then(response => {
                            if (response) {
                                let tag=''
                                if(this.tags.includes("has_upsell-item")){
                                    tag= 'has_upsell-item';
                                    checkCart(variantId,tag);
                                }else if(this.tags.includes("has_free_gift")){
                                    tag = 'has_free_gift';
                                    checkCart(variantId,tag);
                                }

                                publish(PUB_SUB_EVENTS.cartUpdate, {
                                    source: 'product-form',
                                    productVariantId: variantId,
                                    cartData: response,
                                  });
                                this.updateCartDrawer();
                                this.submitBtn.removeAttribute('disabled');
                                console.log("cart",this.cart)
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }

            }

            // Function to update the cart drawer
            async updateCartDrawer() {
                let cartDrawer = document.querySelector(".drawer__inner-empty");
                let cartDrawerDetails = document.querySelector("cart-drawer");
                let cartDraweriTEMS = document.querySelector("cart-drawer-items");
                
                if (cartDrawer) {
                    cartDrawer.remove();
                    cartDraweriTEMS.classList.remove("is-empty")
                    cartDrawerDetails.classList.remove("is-empty");
                }

                const cartCountElement = document.querySelector('#cart-icon-bubble'); // Assuming you have an element with this ID
                let cart = await getCart();
                let cartItemCount = cart.item_count
                let cartSVG = ` <span class="svg-wrapper"><svg xmlns="http://www.w3.org/2000/svg" fill="none" class="icon icon-cart" viewBox="0 0 40 40"><path fill="currentColor" fill-rule="evenodd" d="M20.5 6.5a4.75 4.75 0 0 0-4.75 4.75v.56h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33l-.77-11.6h-3.16v-.57A4.75 4.75 0 0 0 20.5 6.5m3.75 5.31v-.56a3.75 3.75 0 1 0-7.5 0v.56zm-7.5 1h7.5v.56a3.75 3.75 0 1 1-7.5 0zm-1 0v.56a4.75 4.75 0 1 0 9.5 0v-.56h2.22l.71 10.67a4 4 0 0 1-3.99 4.27h-7.38a4 4 0 0 1-4-4.27l.72-10.67z"/></svg>
                </span>
                <div class="cart-count-bubble">
                <span>
                ${cartItemCount}
                </span>
                </div>`

                cartCountElement.innerHTML = cartSVG;
            }
            selectVariant(event){
                let targetElement = event.target;
                let id = targetElement.getAttribute("id");
                this.submitBtn.setAttribute('data-variant-id',id);
                let hiddenInput = this.querySelector("[name='product-id']");
                hiddenInput.setAttribute("value",id)


            }


        })

}
