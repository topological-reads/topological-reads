const { ObjectID } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const groups = mongoCollections.groups;
const users = mongoCollections.users;
const forumsModule = require('./forums');
const userModule = require('./users')

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
            let readGroup = await allGroups.findOne({ _id: ObjectID(id) });
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

    async getGroupsWhereUserIsMember(id) {
        const groupCollection = await groups();
        const groupList = await groupCollection.find({}).toArray();
        // For each group if the id is in the group.members array
        const userGroups = []
        groupList.forEach(group => {
            group.members.forEach(memberId => {
                if (memberId.toString() === id.toString()){
                    userGroups.push(group)
                }
            })
        });
        return userGroups;
    },

    async getPublicGroupsWhereUserIsMember(id) {
        const groupCollection = await groups();
        const groupList = await groupCollection.find({}).toArray();
        // For each group if the id is in the group.members array
        const userGroups = []
        groupList.forEach(group => {
            group.members.forEach(memberId => {
                if (memberId.toString() === id.toString() && group.private === false){
                    userGroups.push(group)
                }
            })
        });
        return userGroups;
    },

    async getAllPublic() {
        const groupCollection = await groups();
        const groupList = await groupCollection.find({ private: false }).toArray();
        return groupList;
    },

      //handles id and list_id as strings
      async addList(id, list_id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!list_id) throw 'ERROR: You must provide an book_id to add';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid id';
        if(!ObjectID.isValid(list_id)) throw 'ERROR: Invalid book_id id';

        const groupCollection = await groups();
        const updatedGroup = await groupCollection.updateOne(
          {_id: ObjectID(id)},
          {$push: {lists: ObjectID(list_id)}}
        );
        if (!updatedGroup.matchedCount && !updatedGroup.modifiedCount){
          throw 'addList failed';
        }
        return this.read(id);
      },

    async update(id, updatedBody) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the groups parameter id for update() was not correct.` };
        const allGroups = await groups();
        const updatedGroup = await allGroups.updateOne(
            { _id: ObjectID(id) },
            { $set: updatedBody }
        );
        if (!updatedGroup.matchedCount && !updatedGroup.modifiedCount){
            throw 'update failed';
          }
        return this.read(id);
    },
    async addAdmin(groupId, userId, ownerId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when adding an admin was incorrect.` }
        if (!userId || !ObjectID.isValid(userId)) { throw `Error: the group parameter userId when adding an admin was incorrect.` }
        if (!ownerId || !ObjectID.isValid(ownerId)) { throw `Error: the group parameter ownerId when adding an admin was incorrect.` }
        try {
            const allGroups = await groups();
            let isMember = false;
            let groupOID = ObjectID(groupId);
            let userOID = ObjectID(userId);
            let ownerOID = ObjectID(ownerId);
            const group = await this.read(groupId);
            if (!group.owner.equals(ownerOID)) {
                throw `Error: Admin privledges cannot be given unless you are the owner.`;
            }
            for (let user of group.members) {
                if (user.equals(userOID)) {
                    isMember = true;
                    break;
                }
            }
            if (isMember) {
                for (let member of group.admins) {
                    if (member.equals(userOID)) {
                        throw `Error: Member ${member} is already an admin in the group.`
                    }
                }
                const addMember = await allGroups.updateOne(
                    { _id: groupOID },
                    { $push: {admins: userOID} }
                );
                return await this.read(groupOID);
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
            let groupOID = ObjectID(groupId);
            let userOID = ObjectID(userId);
            const group = await this.read(groupOID);
            if (group.private) {
                throw `Error: Group ${groupId} is private.`
            }
            for (let member of group.members) {
                if (member.equals(userOID)) {
                    throw `Error: Member is already in the group.`
                }
            }
            const addMember = await allGroups.updateOne(
                { _id: groupOID },
                { $push: {members: userOID} }
            );
            return await this.read(groupOID);
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
            let groupOID = ObjectID(groupId);
            let userOID = ObjectID(userId);
            let adminOID = ObjectID(adminId);
            const allGroups = await groups();
            const allUsers = await users();
            const group = await this.read(groupOID);
            if (!group.private) {
                throw `Error: Group ${groupId} is not a private group.`;
            }
            for (let admin of group.admins) {
                if (admin.equals(adminOID)) {
                    isAdmin = true;
                    break;
                }
            }
            if (isAdmin) {
                for (let member of group.members) {
                    if (member.equals(userOID)) {
                        throw `Error: User ${userId} is already a member of group: ${groupId}`;
                    }
                }
                for (let invitee of group.invitees) {
                    if (invitee.equals(userOID)) {
                        throw `Error: User ${userId} is already an invitee of group: ${groupId}`;
                    }
                }
                const addInvitee = await allGroups.updateOne(
                    { _id: groupOID },
                    { $push: {invitees: userOID} }
                );
                const sendInvite = await allUsers.updateOne(
                    { _id: userOID },
                    { $push: {invitations: groupOID} }
                );
                return await this.read(groupOID);
            }
            
        } catch (e) {
            throw `Error while sending group invite: ${e}`;
        }
    },

    async inviteResponse(groupId, userId, response = false) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when responding to invitations was incorrect.` }
        if (!userId || !ObjectID.isValid(userId)) { throw `Error: the group parameter userId when responding to invitations was incorrect.` }
        try {
            let groupOID = ObjectID(groupId);
            let userOID = ObjectID(userId);
            const allGroups = await groups();
            const allUsers = await users();
            const group = await this.read(groupOID);
            if (!group.private) {
                throw `Error: Group ${groupId} is not a private group.`;
            }
            for (let invitee of group.invitees) {
                if (invitee.equals(userOID)) {
                    if (response) {
                        const acceptInvite = await allGroups.updateOne(
                            { _id: groupOID },
                            { $push: {members: userOID} }
                        )
                        const removeInvitee = await allGroups.updateOne(
                            { _id: groupOID },
                            { $pull: {invitees: userOID} }
                        )
                        const removeInvite = await allUsers.updateOne(
                            { _id: userOID },
                            { $pull: {invitations: groupOID} }
                        )
                        const addGroup = await allUsers.updateOne(
                            { _id: userOID},
                            { $push: {groups: groupOID} }
                        )
                        return await this.read(groupOID);
                    } else {
                        const removeInvitee = await allGroups.updateOne(
                            { _id: groupOID },
                            { $pull: {invitees: userOID} }
                        )
                        const removeInvite = await allUsers.updateOne(
                            { _id: userOID },
                            { $pull: {invitations: groupOID} }
                        )
                        return await this.read(groupOID);
                    }
                }
            }
        } catch (e) {
            throw `Error while responding to invitation: ${e}`;
        }
    },

    async deleteSelf(groupId, selfId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when deleting self was incorrect.` }
        if (!selfId || !ObjectID.isValid(selfId)) { throw `Error: the group parameter selfId when deleting self was incorrect.` }
        try {
            let groupOID = ObjectID(groupId);
            let selfOID = ObjectID(selfId);
            const thisGroup = await this.read(groupOID);
            const allGroups = await groups();
            const allUsers = await users();
            for (let admin of thisGroup.admins) {
                if (admin.equals(selfOID)) {
                    const deleteAdmin = await allGroups.updateOne(
                        { _id: groupOID },
                        { $pull: {admins: selfOID} }
                    );
                }
            }
            for (let member of thisGroup.members) {
                if (member.equals(selfOID)) {
                    const deleteMember = await allGroups.updateOne(
                        { _id: groupOID },
                        { $pull: {members: selfOID} }
                    );
                }
            }
            const removeGroup = await allUsers.updateOne(
                { _id: selfOID },
                { $pull: { groups: groupOID} }
            );
            return await userModule.get(selfOID);
        } catch (e) {
            throw `Error: Issue while deleting user: ${selfId} by self.`;
        }
    },

    async deleteAdmin(groupId, adminId, ownerId) {
        if (!groupId || !ObjectID.isValid(groupId)) { throw `Error: the group parameter groupId when deleting an Admin was incorrect.` }
        if (!adminId || !ObjectID.isValid(adminId)) { throw `Error: the group parameter adminId when deleting an Admin was incorrect.` }
        if (!ownerId || !ObjectID.isValid(ownerId)) { throw `Error: the group parameter ownerId when deleting an Admin was incorrect.` }
        try {
            let groupOID = ObjectID(groupId);
            let adminOID = ObjectID(adminId);
            let ownerOID = ObjectID(ownerId);
            const allGroups = await groups();
            const group = await this.read(groupOID);
            if (!group.owner.equals(ownerOID)) {
                throw `Error: Admin privledges cannot be removed unless you are the owner.`;
            }
            for (let admin of group.admins) {
                if (admin.equals(adminOID)) {
                    const deleteAdmin = await allGroups.updateOne(
                        { _id: groupOID },
                        { $pull: {admins: adminOID} }
                    );
                    return await this.read(groupOID);
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
            let groupOID = ObjectID(groupId);
            let memberOID = ObjectID(memberId);
            let adminOID = ObjectID(adminId);
            const allGroups = await groups();
            const allUsers = await users();
            const group = await this.read(groupOID);
            for (let admin of group.admins) {
                if (admin.equals(adminOID)) {
                    isAdmin = true;
                    break;
                }
            }
            if (isAdmin) {
                for (let member of group.members) {
                    if (member.equals(memberOID)) {
                        const deleteMember = await allGroups.updateOne(
                            { _id: groupOID },
                            { $pull: {members: memberOID} }
                        );
                        const removeGroup = await allUsers.updateOne(
                            { _id: memberOID },
                            { $pull: {groups: groupOID} }
                        )
                        return await this.read(groupOID);
                    }
                }
                throw `Error: User ${memberId} is not a member of group: ${groupId}`;
            } else {
                throw `Error: User ${adminId} is not an admin of this group: ${groupId}`;
            }

        } catch (e) {
            throw `Error while deleting a member: ${e}`;
        }
    },
    async delete(id) {
        if (!id || !ObjectID.isValid(id)) { throw `Error: the thread parameter id for delete() was not correct.` };
        const allGroups = await groups();
        let oID = ObjectID(id);
        const group = await this.read(oID);
        try {
            const deletedForum = await forumsModule.delete(group.forum);
        } catch (e) {
            throw `Error: there was an issue deleting the forum within group: ${id}. ${e}`;
        }
        // TODO: Delete Reading Lists as well once that functionality is done
        try {
            const deletedGroup = await allGroups.deleteOne({ _id: oID });
        } catch (e) {
            throw `Error: there was an issue deleting group: ${id}. ${e}`;
        }
        return { groupId: id, deleted: true };
    }
} 