const { ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const groups = mongoCollections.groups;
const forumsModule = require('./forums');

module.exports = {
    async create(name, creator, private = false, groupTags = []) {
        if (!name.trim() || typeof name !== `string`) { throw `Error: there was an improper name: ${name} parameter when creating a group.` };
        let groups_list = await this.getAll();
        for(group of groups_list){
            if(name === group.name){
                throw "ERROR: Name is already taken!"
            }
        }
        if (!creator || !ObjectID(creator)) { throw `Error: there was an improper creator: ${creator} parameter when creating a group.` };
        if (typeof private !== `boolean`) { throw `Error: the private parameter must be a boolean.` };
        if (!Array.isArray(groupTags)) { throw `Error: the groupTags paramter must be an array.` };
        let newGroup = {
            name: name,
            private: private,
            members: [creator],
            adminsId: ObjectID(),
            admins: [creator],
            lists: [],
            forum: ObjectID(),
            invitees: [],
            tags: groupTags
        }
        const allGroups = await groups();
        const insertedGroup = await allGroups.insertOne({ name: name });
        if (insertedGroup.insertCount === 0) { throw `Error: There was an error while creating the group: ${name}` };
        const newForum = await forumsModule.create(insertedGroup.insertedId);
        newGroup.forum = newForum.insertedId;
        const groupForum = await allGroups.updateOne(
            { _id: insertedGroup.insertedId },
            { $set: newGroup }
        )
        const recentGroup = await this.read(insertedGroup.insertedId);
        return recentGroup;
    },
    async read(id) {
        if (!id || !ObjectID(id)) { throw `Error: the group parameter id for read() was not correct.` };
        const allGroups = await groups();
        try {
            let readGroup = await allGroups.findOne({ _id: id });
            return readGroup;
        } catch (e) {
            throw `Error: the group: ${id} could not be found.`;
        }
    },
    async getAll() {
        const groupCollection = await groups();
        const groupList = await groupCollection.find({}).toArray();
        return groupList;
    },

    async update(id, updatedBody) {
        if (!id || !ObjectID(id)) { throw `Error: the thread parameter id for update() was not correct.` };
        const allGroups = await groups();
        const findGroup = await this.read(id);
        const updatedGroup = await allGroups.updateOne(
            { _id: id },
            { $set: updatedBody }
        );
        return await this.read(id);
    },
    async addAdmin(id) {
        // TODO: Currently Working On has been a part of the delay

    },
    async addMember() {
        // TODO: Currently Working On has been a part of the delay
    },
    async deleteAdmin() {
        // TODO: Currently Working On has been a part of the delay
    },
    async deleteMember() {
        // TODO: Currently Working On has been a part of the delay
    },
    async delete(id) {
        if (!id || !ObjectID(id)) { throw `Error: the thread parameter id for delete() was not correct.` };
        const allGroups = await groups();
        const group = await this.read(id);
        try {
            const deletedForum = await forumsModule.delete(group.forum);
        } catch (e) {
            throw `Error: there was an issue deleting the forum within group: ${id}. ${e}`;
        }
        // TODO: Delete Reading Lists as well once that functionality is done
        try {
            const deletedGroup = await allGroups.deleteOne({ _id: id });
        } catch (e) {
            throw `Error: there was an issue deleting group: ${id}. ${e}`;
        }
        return { groupId: id, deleted: true };
    }
} 