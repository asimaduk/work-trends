const express = require('express');

const auth = require('../../middlewares/auth');

const Report = require('../../models/Report');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    // Create a new report
    try {
        let newReport = req.body;

        const report = new Report(newReport);
        report.save((err) => {
            if(err){ return res.status(500).send({ message: err.message }); }

            res.status(200).send({report})
        });
    } catch (error) {
        res.status(400).send({message: error})
    }
})

router.get('/', auth, async (req, res) => {
    // Get reports
    const limit = Math.abs(req.query.limit) || 10;
    const page = (Math.abs(req.query.page) || 1) - 1;

    const conditions = {};

    if(!req.user.isAdmin){
        conditions.userId = req.user._id;
        console.log('Not an admin...')
    }

    try {
        const reports = await Report.find(conditions).sort( { '_id': -1 } ).limit(limit).skip(limit * page);
        console.log('reports found total',reports.length, 'user id', req.user._id)

        res.status(200).send({ reports })
    } catch (error) {
        res.status(400).send({message: 'An unknown error occurred. Please try again.'});
    }
})

router.get('/search', auth, async (req, res) => {
    try {
        const conditions = {}

        if(req.query.userFullname){
            conditions.userFullname = {'$regex' : req.query.userFullname, '$options' : 'i'};
        }

        if(req.query.username){
            conditions.username = {'$regex' : req.query.username, '$options' : 'i'};
        }

        if(!req.user.isAdmin){
            conditions._id = req.user._id;
        }

        const reports = await Report.find(conditions).sort( { '_id': -1 } ).limit(5);

        console.log('report search results count',reports.length);

        res.status(200).send({ reports });
    } catch (error) {
        console.log(error)
        res.status(400).send({error: 'An unknown error occurred. Please try again.'});
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        if(!req.user.isAdmin && (req.user._id !== req.params.id)){
            res.status(401).send({error: 'You not authorized to view this report!'});
        }

        const report = await Report.findById(req.params.id);

        res.status(200).send({ report })
    } catch (error) {
        res.status(400).send({error: 'Report not found'});
    }
})

router.put('/', auth, async (req, res) => {
    // Update report
    try {
        if(req.user._id !== req.body.userId){
            res.status(401).send({error: 'You not authorized to edit this report!'});
        }

        await Report.findByIdAndUpdate(req.body._id, req.body);

        res.status(200).send({message: 'Report updated'});
    } catch (error) {
        res.status(400).send({error: 'An unknown error occurred. Please try again.'})
    }
})

router.delete('/', auth, async (req, res) => {
    // Delete message(s)
    try {
        let conditions = {};

        if(!req.user.isAdmin){
            conditions._id = req.user._id;
        }
        else if(req.body.conditions){
            conditions = req.body.conditions;
        }

        await Report.deleteMany(conditions);
        
        console.log('reports(s) delete done. Conditions are', conditions)

        res.status(200).send({message: 'Delete successful'})
    } catch (error) {
        res.status(400).send({error: 'An unknown error occurred. Please try again.'})
    }
})

module.exports = router;