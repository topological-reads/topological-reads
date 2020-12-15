const { ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const forums = mongoCollections.forums;
const threadModule = require('./threads');

module.exports = {
    async create(group) {
        if (!group || !ObjectID.isValid(group)) { throw `Error: there was an improper group: ${group} parameter when creating a forum.`}
        let newForum = {
            group: group,
            threads: []
        }
        const allForums = await forums();
        const insertForum = await allForums.insertOne(newForum);
        if (insertForum.insertCount === 0) { throw `Error: There was an issue while creating a group's forum.` };
        const insertedForum = await this.read(insertForum.insertedId);
        return insertForum;
    },
    async read(id) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the forum parameter id for read() was not correct.` };
        const allForums = await forums();
        try {
            let currentForum = await allForums.findOne({ _id: id });
            return currentForum;
        } catch (e) {
            throw `Error: Forum with the id: ${id} could not be found.`;
        }
    },
    async update(id, updatedBody) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the forum parameter id for update() was not correct.` };
        if (!updatedBody || typeof updatedBody !== `object`) { throw `Error: the forum parameter updatedBody for update() was not correct.`}
        if (!updatedBody.group || !ObjectID(updatedBody.group)) { throw `Error: the updatedBody did not have the proper group: ${updatedBody.group}`};
        const thisForum = await this.read(id);
        const allForums = await forums();
        updatedBody.threads = thisForum.threads;
        const updatedForum = await allForums.updateOne(
            { _id: id },
            { $set: updatedBody }
        )

        return await this.read(id);
    },
    async delete(id) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the forum parameter forumId for insertThread() was not correct.` };
        const thisForum = await this.read(id);
        const allForums = await forums();
        for( let thread of thisForum.threads) {
            try {
                const deletedThread = await threadModule.delete(thread);
            } catch (e) {
                throw `Error: the thread: ${thread} could not be deleted. ${e}` ;
            }
        };
        try {
            const deletedForum = await allForums.deleteOne({ _id: id });
        } catch (e) {
            throw `Error: the forum: ${id} could not be deleted. ${e}`;
        }
        return { forumId: id, deleted: true };
    }
} 