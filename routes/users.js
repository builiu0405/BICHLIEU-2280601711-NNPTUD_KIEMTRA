const express = require('express');
let router = express.Router();
let userSchema = require('../schemas/users');

router.get('/', async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.query.username) {
            query.username = new RegExp(req.query.username, 'i'); // includes
        }
        let items = await userSchema.find(query).populate('role');
        res.send(items);
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let item = await userSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        }).populate('role');
        if (!item) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(item);
        }
    } catch (error) {
        res.status(404).send({ message: "something went wrong" });
    }
});

router.post('/', async (req, res) => {
    try {
        let newItem = new userSchema({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            status: req.body.status,
            role: req.body.role,
            loginCount: req.body.loginCount || 0
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
        let getItem = await userSchema.findByIdAndUpdate(
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
        let getItem = await userSchema.findOne({
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

// Enable status
router.post('/enable', async (req, res) => {
    try {
        let { email, username } = req.body;
        let item = await userSchema.findOne({ email, username, isDeleted: false });
        if (!item) {
            res.status(404).send({ message: "User not found with matching email and username" });
        } else {
            item.status = true;
            await item.save();
            res.send(item);
        }
    } catch(error) {
         res.status(400).send({ message: error.message });
    }
});

// Disable status
router.post('/disable', async (req, res) => {
    try {
        let { email, username } = req.body;
        let item = await userSchema.findOne({ email, username, isDeleted: false });
        if (!item) {
            res.status(404).send({ message: "User not found with matching email and username" });
        } else {
            item.status = false;
            await item.save();
            res.send(item);
        }
    } catch(error) {
         res.status(400).send({ message: error.message });
    }
});

module.exports = router;
