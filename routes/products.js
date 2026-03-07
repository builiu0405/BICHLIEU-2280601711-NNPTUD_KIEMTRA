const express = require('express')
let router = express.Router()
let slugify = require('slugify');
let productSchema = require('../schemas/products');//DBset/DBContext

router.get('/', async (req, res) => {
    try {
        let items = await productSchema.find({ isDeleted: false }).populate('category');
        res.send(items);
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
})

router.get('/:id', async (req, res) => {
    try {
        let item = await productSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        }).populate('category');
        if (!item) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(item);
        }
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
})

router.post('/', async function (req, res, next) {
    try {
        let newItem = new productSchema({
            title: req.body.title,
            slug: slugify(req.body.title, {
                replacement: '-',
                lower: false,
                remove: undefined,
            }),
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            images: req.body.images || ["https://i.imgur.com/cHddUCu.jpeg"] // default or request data
        })
        await newItem.save();
        res.status(201).send(newItem);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        let body = {...req.body};
        if(body.title) {
            body.slug = slugify(body.title, {
                replacement: '-',
                lower: false,
                remove: undefined,
            });
        }
        let getItem = await productSchema.findByIdAndUpdate(
            req.params.id, body, {
            new: true
        });
        if (getItem) {
            res.send(getItem);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

router.delete('/:id', async function (req, res, next) {
    try {
        let getItem = await productSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!getItem) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            getItem.isDeleted = true;
            await getItem.save();
            res.send(getItem);
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
})

module.exports = router;