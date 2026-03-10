const express = require('express');
let router = express.Router();
let roleSchema = require('../schemas/roles');
let userSchema = require('../schemas/users'); // For the /:id/users endpoint

router.get('/', async (req, res) => {
    try {
        let items = await roleSchema.find({ isDeleted: false });
        res.send(items);
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let item = await roleSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!item) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(item);
        }
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
});

// GET /roles/:id/users
router.get('/:id/users', async (req, res) => {
    try {
        let users = await userSchema.find({
            isDeleted: false,
            role: req.params.id
        }).populate('role');
        res.send(users);
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
});

router.post('/', async (req, res) => {
    try {
        let newItem = new roleSchema({
            name: req.body.name,
            description: req.body.description
        });
        await newItem.save();
        res.status(201).send(newItem);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        let body = {...req.body};
        let getItem = await roleSchema.findByIdAndUpdate(
            req.params.id, body, { new: true }
        );
        if (getItem) {
            res.send(getItem);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let getItem = await roleSchema.findOne({
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
});

module.exports = router;
