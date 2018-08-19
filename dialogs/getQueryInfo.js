const { EntityRecognizer } = require('botbuilder')

const { MessageTexts } = require('../helpers/consts')
const utils = require('../helpers/utils')
const PostModel = require('../models/posts')

module.exports = {
    id: 'getQueryInfo',
    name: undefined,
    waterfall: [(session, args, next) => {
        const { entities } = args
        const local_search_query = EntityRecognizer.findEntity(entities, 'local_search_query')
        if (local_search_query) {
            session.dialogData.query = local_search_query.entity
            next()
        } else session.endDialog(MessageTexts.DEFAULT_RESPONSE, utils.getRandomQuery())


    }, async (session) => {
        let { query } = session.dialogData
        session.sendTyping()
        let posts = await PostModel.find({ title: new RegExp(query, 'i') }).skip(0).limit(5).sort('-updated')
        let message
        try {
            message = utils.buildNewsCards(session, posts)
            session.send(MessageTexts.HERE_YOU_GO)
            session.endDialog(message)
        } catch (e) {
            if (e instanceof RangeError)
                session.endDialog(MessageTexts.NO_POSTS)
            else
                console.error(e)
        }
    }]
}