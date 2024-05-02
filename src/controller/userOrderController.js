
const { Order, OrderReturn, Review } = require('../models/orderModels');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const { calculateDeliveryCharge, getCordinates, getDistance } = require('../helpers/calculateDeliveryCharge');
const userHelper = require('../helpers/validations');

const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({
    key_id: 
})

const orderConfirm = asyncHandler(async (req, res, next) => {

    let orderId = Math.round(Math.random() * 10000) + 1
    let user = req.session.user
    let { addressId, paymentMethod } = req.body;

    let address = await Address.findById({ _id: addressId });
   

        let products = await Cart.findOne({
            user: new mongoose.Types.ObjectId(user._id)
        }, {
            products: 1,
            _id: 0

        }).populate('products.product')

        let orderedItems = await Cart.findOne({
            user: new mongoose.Types.ObjectId(user._id)
        }, {
            products: 1,
            _id: 0,


        })


        console.log('products,', JSON.stringify(products))
        console.log('orderedItems,', JSON.stringify(orderedItems))


        products.products.forEach(async (item) => {

            let newProduct = await Inventory.findOneAndUpdate({
                product: item.product,
                'sizeVariant.size': item.size
            }, {
                $inc: {
                    'sizeVariant.$.stock': -parseInt(item.quantity)
                }
            },
                { new: true }
            );
            console.log('newProduct', newProduct)


        })

        let orderAmout = products.products.map(item => item.product.price * item.quantity).reduce((acc, item) => acc + item);

        orderedItems = orderedItems.products.map(item => {

            return {
                product: item.product,
                quantity: item.quantity,
                size: item.size,
            }
        })

        // updating product's soldCount 
        orderedItems.forEach(async item => {
            await Product.findOneAndUpdate({
                _id: item.product
            },
                {
                    $inc: {
                        soldCount: 1
                    }
                }
            )
        })

    if (paymentMethod == 'COD') {

        let order = await Order.create({
            user: user._id,
            address,
            paymentMethod,
            paymentStatus: 'Paid',
            orderId,
            orderedItems,
            orderAmout
        });
        await Cart.deleteOne({
            user: user._id
        })
        return res.status(201)
        .json({
            success: true,
            error: false,
            data: order,
            orderType: 'COD',
            message: 'order placed'
        })

    } else {

        let order = await Order.create({
            user: user._id,
            address,
            paymentMethod,
            orderId,
            orderedItems,
            orderAmout,
            orderStatus: 'Pending'
        });


        await Cart.deleteOne({
            user: user._id
        })
        return res.status(200)
            .json({
                success: true,
                error: false,
                orderType: paymentMethod,
                data: order,
                message: 'order placed'
            })

        }
      






    })

const orderCancel = asyncHandler(async (req, res, next) => {
    let user = req.session.user;
    if (!user) return res.redirect('/api/v1/')
    console.log(req.body)
    let { reason, comments, id } = req.body;
    let cancelDetails = { reason, comment: comments }

    let order = await Order.findOneAndUpdate({
        _id: id
    },
        {
            $set: {
                isCancelled: true,
                cancelDetails,
                orderStatus: 'Cancelled'

            }
        }, {

        new: true
    });
    console.log(order, 'order')
    let product;
    order.orderedItems.forEach(async item => {

        product = await Inventory.findOneAndUpdate({
            product: item.product

        },
            {
                $inc: {
                    quantity: item.quantity
                }
            }
        )
        console.log('product :', product, 'item :', item)
    })


    return res.json({
        success: true,
        error: false,

        result: order,
        message: 'Order cancelled successfully'
    });


});


const orderProductReview = asyncHandler(async (req, res) => {
    let user = req.session.user
    if (!user) return res.redirect('/api/v1')
    let { rating, comment, orderId, productId, size } = req.body;

    let updatedReviewOrder = await Order.findOneAndUpdate({
        _id: orderId,
        'orderedItems.product': productId,
        'orderedItems.size': size

    },
        {
            $set: {
                'orderedItems.$.isReviewed': true
            }

        },
        {
            new: true
        }
    )
    console.log(updatedReviewOrder, 'updatedReview')
    let product = await Product.findOne({ _id: productId });
    let ratingCount = +product.productReviews.length;
    let currentRatingAvg = +product.avgRating;
    let newRatingAvg;

    if (ratingCount != 0) {
        newRatingAvg = ((+ratingCount * +currentRatingAvg) + +rating) / (+ratingCount + 1)
    } else {
        newRatingAvg = +rating
    }


    let reviewProduct = await Product.findOneAndUpdate({
        _id: productId
    },
        {
            $set: {
                avgRating: +newRatingAvg,


            },
            $push: {
                productReviews: {
                    rating,
                    user: user._id,
                    comment
                }
            }
        },
        {
            new: true
        }
    )

    return res.status(201)
        .json({

            success: true,
            error: false,
            data: reviewProduct,
            message: 'Product review successfully submited'
        })







})

const orderReturn = asyncHandler(async (req, res) => {
    console.log(req.body)
})

const addCoupon = asyncHandler(async (req, res) => {
    let code = req.body.code;
    let user = req.session.user;
    let coupon = await Coupon.findOne({
        couponCode: code
    })
    console.log('coupon', coupon)
    let now = new Date;

    if (!coupon) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon not found!'
            })
    }
    let expiryDate = new Date(coupon.expiryDate)
    if (now.getTime() > expiryDate.getTime()) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon is expired!'
            })

    }
    if (now.getTime() > expiryDate.getTime()) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon is expired!'
            })

    }
    if (coupon.appliedUsers.includes(user._id)) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'You have already rediemed this coupon!'
            })

    }
    if (!coupon.limit) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon limit is over!'
            })

    }
    coupon.limit -= 1;
    coupon.appliedUsers.push(user._id)
    await coupon.save()

    let cart = await Cart.findOne({ user: user._id });
    let discount = Math.trunc((coupon.discount * cart.cartTotal) / 100)
    cart.isCouponApplied = true;
    cart.coupon = {
        name: coupon.title,
        discount,
    }
    cart = await cart.save();
    return res.status(200)
        .json({
            success: true,
            error: false,
            data: cart,
            message: 'Coupon rediemed!'
        })


});

const loadMyOrders = asyncHandler(async (req, res) => {

    let user = req.session?.user;
    if (!user) return res.redirect('/api/v1/')

    let order = await Order.find({
        user: user._id
    })
        .populate('address')
        .populate('orderedItems.product')
        .sort({createdAt: -1})
    console.log('my order ==========================================',JSON.stringify(order))

    res
        .render('user/myOrders',
            {
                order,
                user,
            })


})

const loadSingleOrderDetails = asyncHandler(async (req, res, next) => {
    let user = req.session.user
    let id = req.query.id;
    let order = await Order.findOne({ _id: id , user:user._id})
        .populate('user')
        .populate('orderedItems.product')
        .sort({ createdAt: -1 });
        console.log('order==============================',order)
    if (!order) {
           return res.json({
                success: false,
                error: true,
                message:" something went wrong"
            })
        }
    console.log(order)
    res.render('user/singleOrderDetails',{user, order})
})



module.exports = {
    orderConfirm,
    orderCancel,
    orderProductReview,
    orderReturn,
    addCoupon,
    loadMyOrders,
    loadSingleOrderDetails,

}