const { ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const forums = mongoCollections.forums;
const threads = mongoCollections.threads;
const forumModule = require('./forums');

module.exports = {
    async create(forum, op, initialComment) {
        if (!forum || !ObjectID(forum)) {
            throw `Error: Ivalid forum while creating a forum thread.`;
        }
        if (!op || !ObjectID(op)) {
            throw `Error: Invalid original poster while creating a forum thread`;
        }
        if (!initialComment.trim() || typeof initialComment !== `string`) {
            throw `Error: Invalid first comment while creating a forum thread`;
        }
        let newForum = {
            forum: forum,
            op: op,
            initialComment: initialComment,
            comments: []
        }
        const threadsCollection = await threads();
        const forumsCollection = await forums();
        const createThread = await threadsCollection.insertOne(newForum);
        if (createThread.insertCount === 0) { throw `Error: There was an issue when adding the forum thread from: ${op}` };
        const insertThread = await forumsCollection.updateOne(
            { _id: forum },
            { $push: {threads: createThread.insertedId} }
        );
        if (insertThread.matchedCount === 0) { throw `Error: There was an issue when adding the thread: ${createThread.insertedId} to the forum: ${forum}` };
        const newForumThread = await this.read(createThread.insertedId);
        return newForumThread;
    },
    async read(id) {
        if (!id || !ObjectID(id)) { throw `Error: the thread parameter id for read() was not correct.` };
        const gettingForums = await threads();
        try {
            let readThread = await gettingForums.findOne({ _id: id });
            return readThread;
        } catch (e) {
            throw `Error: Thread: ${id} was not found.`;
        }
    },
    async update(id, updatedBody) {
        if (!id || !ObjectID(id)) { throw `Error: the thread parameter id for read() was not correct.` };
        const thisThread = await this.read(id);
        const allThreads = await threads();
        if (!updatedBody.forum) {
            updatedBody.forum = thisThread.forum;
        }
        if (!updatedBody.op) {
            updatedBody.op = thisThread.op;
        }
        if (!updatedBody.initialComment) {
            updatedBody.initialComment = thisThread.initialComment;
        }
        updatedBody.comments = thisThread.comments;
        const updatedThread = await allThreads.updateOne(
            { _id: id },
            { $set: updatedBody }
        )
        if (updatedThread.matchedCount === 0) { throw `Error: Thread: ${id} was not updated properly.`};
        return await this.read(id);
    },
    async delete(id) {
        if (!id || !ObjectID(id)) { throw `Error: the thread parameter id for read() was not correct.` };
        const threadCollection = await threads();
        const forumsCollection = await forums();
        const threadForum = await this.read(id);
        const thisForum = await forumsCollection.findOne({ _id: threadForum.forum });
        let forumBody = thisForum;
        for (let thread in forumBody.threads) {
            if (forumBody.threads[thread].toString() === id.toString()) {
                forumBody.threads.splice(thread, 1);
            }
        }
        try {
            const updatedForum = await forumsCollection.updateOne(
                { _id: threadForum.forum },
                { $set: forumBody }
            );
        } catch (e) {
            throw `Error: Forum: ${threadForum.forum} was not found while deleting thread: ${threadForum._id}.  ${e}`;
        }
        try {
            const deletedThread = await threadCollection.deleteOne({ _id: id });
        } catch (e) {
            throw `Error: issue when deleting thread: ${id}. ${e}`;
        }
        return {threadId: id, deleted: true};
    }
} 