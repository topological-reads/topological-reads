const { ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const groups = mongoCollections.groups;
const users = mongoCollections.users;
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
        if (!creator || !ObjectID.isValid(creator)) { throw `Error: there was an improper creator: ${creator} parameter when creating a group.` };
        if (typeof private !== `boolean`) { throw `Error: the private parameter must be a boolean.` };
        if (!Array.isArray(groupTags)) { throw `Error: the groupTags paramter must be an array.` };
        let newGroup = {
            name: name,
            private: private,
            members: [creator],
            owner: creator,
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
        if (!id || !ObjectID.isValid(id)) { throw `Error: the groups parameter id for read() was not correct.` };
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

    async getAllPublic() {
        const groupCollection = await groups();
        const groupList = await groupCollection.find({ private: false }).toArray();
        return groupList;
    },

    async update(id, updatedBody) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the groups parameter id for update() was not correct.` };
        const allGroups = await groups();
        const findGroup = await this.read(id);
        const updatedGroup = await allGroups.updateOne(
            { _id: id },
            { $set: updatedBody }
        );
        return await this.read(id);
    },
    async addAdmin(groupId, userId, ownerId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when adding an admin was incorrect.` }
        if (!userId || !ObjectID.isValid(userId)) { throw `Error: the group parameter userId when adding an admin was incorrect.` }
        if (!ownerId || !ObjectID.isValid(ownerId)) { throw `Error: the group parameter ownerId when adding an admin was incorrect.` }
        try {
            const allGroups = await groups();
            let isMember = false;
            const group = await this.read(groupId);
            if (!group.owner.equals(ownerId)) {
                throw `Error: Admin privledges cannot be given unless you are the owner.`;
            }
            for (let user of group.members) {
                if (user.equals(userId)) {
                    isMember = true;
                    break;
                }
            }
            if (isMember) {
                for (let member of group.admins) {
                    if (member.equals(userId)) {
                        throw `Error: Member ${member} is already an admin in the group.`
                    }
                }
                const addMember = await allGroups.updateOne(
                    { _id: groupId },
                    { $push: {admins: userId} }
                );
                return await this.read(groupId);
            } else {
                throw `This user was not a member of the group: ${groupId}`;
            }
        } catch (e) {
            throw `Error when adding admin ${e}`;
        }

    },
    async addPublicMember(groupId, userId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when adding a public member was incorrect.` }
        if (!userId || !ObjectID.isValid(userId)) { throw `Error: the group parameter userId when adding a public member was incorrect.` }
        try {
            const allGroups = await groups();
            const group = await this.read(groupId);
            if (group.private) {
                throw `Error: Group ${groupId} is private.`
            }
            for (let member of group.members) {
                if (member.equals(userId)) {
                    throw `Error: Member is already in the group.`
                }
            }
            const addMember = await allGroups.updateOne(
                { _id: groupId },
                { $push: {members: userId} }
            );
            return await this.read(groupId);
        } catch (e) {
            throw `Error while adding public member: ${e}`
        }
    },

    async invitePrivateMember(groupId, userId, adminId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when inviting a user to a private group was incorrect.` }
        if (!userId || !ObjectID.isValid(userId)) { throw `Error: the group parameter userId when inviting a user to a private group was incorrect.` }
        if (!adminId || !ObjectID.isValid(adminId)) { throw `Error: the group parameter ownerId when inviting a user to a private group was incorrect.` }
        try {
            let isAdmin = false;
            const allGroups = await groups();
            const allUsers = await users();
            const group = await this.read(groupId);
            if (!group.private) {
                throw `Error: Group ${groupId} is not a private group.`;
            }
            for (let admin of group.admins) {
                if (admin.equals(adminId)) {
                    isAdmin = true;
                    break;
                }
            }
            if (isAdmin) {
                for (let member of group.members) {
                    if (member.equals(userId)) {
                        throw `Error: User ${userId} is already a member of group: ${groupId}`;
                    }
                }
                for (let invitee of group.invitees) {
                    if (invitee.equals(userId)) {
                        throw `Error: User ${userId} is already an invitee of group: ${groupId}`;
                    }
                }
                const addInvitee = await allGroups.updateOne(
                    { _id: groupId },
                    { $push: {invitees: userId} }
                );
                const sendInvite = await allUsers.updateOne(
                    { _id: userId },
                    { $push: {invitations: groupId} }
                );
                return await this.read(groupId);
            }
            
        } catch (e) {
            throw `Error while sending group invite: ${e}`;
        }
    },

    async inviteResponse(groupId, userId, response = false) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when responding to invitations was incorrect.` }
        if (!userId || !ObjectID.isValid(userId)) { throw `Error: the group parameter userId when responding to invitations was incorrect.` }
        try {
            const allGroups = await groups();
            const allUsers = await users();
            const group = await this.read(groupId);
            if (!group.private) {
                throw `Error: Group ${groupId} is not a private group.`;
            }
            for (let invitee of group.invitees) {
                if (invitee.equals(userId)) {
                    if (response) {
                        const acceptInvite = await allGroups.updateOne(
                            { _id: groupId },
                            { $push: {members: userId} }
                        )
                        const removeInvitee = await allGroups.updateOne(
                            { _id: groupId },
                            { $pull: {invitees: userId} }
                        )
                        const removeInvite = await allUsers.updateOne(
                            { _id: userId },
                            { $pull: {invitations: groupId} }
                        )
                        const addGroup = await allUsers.updateOne(
                            { _id: userId},
                            { $push: {groups: groupId} }
                        )
                        return await this.read(groupId);
                    } else {
                        const removeInvitee = await allGroups.updateOne(
                            { _id: groupId },
                            { $pull: {invitees: userId} }
                        )
                        const removeInvite = await allUsers.updateOne(
                            { _id: userId },
                            { $pull: {invitations: groupId} }
                        )
                        return await this.read(groupId);
                    }
                }
            }
        } catch (e) {
            throw `Error while responding to invitation: ${e}`;
        }
    },

    async deleteAdmin(groupId, adminId, ownerId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when deleting an Admin was incorrect.` }
        if (!adminId || !ObjectID.isValid(adminId)) { throw `Error: the group parameter adminId when deleting an Admin was incorrect.` }
        if (!ownerId || !ObjectID.isValid(ownerId)) { throw `Error: the group parameter ownerId when deleting an Admin was incorrect.` }
        try {
            const allGroups = await groups();
            const group = await this.read(groupId);
            if (!group.owner.equals(ownerId)) {
                throw `Error: Admin privledges cannot be removed unless you are the owner.`;
            }
            for (let admin of group.admins) {
                if (admin.equals(adminId)) {
                    const deleteAdmin = await allGroups.updateOne(
                        { _id: groupId },
                        { $pull: {admins: adminId} }
                    );
                    return await this.read(groupId);
                }
            }
            throw `Error: User ${adminId} is not an admin of group: ${groupId}`;
        } catch (e) {
            throw `Error while deleting an admin: ${e}`;
        }
    },
    async deleteMember(groupId, memberId, adminId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when deleting a member was incorrect.` }
        if (!adminId || !ObjectID.isValid(adminId)) { throw `Error: the group parameter adminId when deleting a member was incorrect.` }
        if (!memberId || !ObjectID.isValid(memberId)) { throw `Error: the group parameter memberId when deleting a member was incorrect.` }
        try {
            let isAdmin = false;
            const allGroups = await groups();
            const allUsers = await users();
            const group = await this.read(groupId);
            for (let admin of group.admins) {
                if (admin.equals(adminId)) {
                    isAdmin = true;
                    break;
                }
            }
            if (isAdmin) {
                for (let member of group.members) {
                    if (member.equals(memberId)) {
                        const deleteMember = await allGroups.updateOne(
                            { _id: groupId },
                            { $pull: {members: memberId} }
                        );
                        const removeGroup = await allUsers.updateOne(
                            { _id: memberId },
                            { $pull: {groups: groupId} }
                        )
                        return await this.read(groupId);
                    }
                }
                throw `Error: User ${memberId} is not a member of group: ${groupId}`;
            } else {
                throw `Error: User ${adminId} is not an admin of this group: ${groupId}`;
            }

        } catch (e) {
            throw `Error while deleting an admin: ${e}`;
        }
    },
    async delete(id) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the thread parameter id for delete() was not correct.` };
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