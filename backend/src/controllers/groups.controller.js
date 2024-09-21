const { Group } = require("../models/groups.models");
const { GroupInfo } = require("../models/groupsInfo.models");
const ApiErrors = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const createGroups = async (req, res) => {
  try {
    const { group_name, description } = req.body;
    const username = req.user.username;
    const userid = req.user._id;
    if (!group_name) throw new ApiErrors(401, "Group name cannot be empty.");
    const file = req.file;
    let avatar_url;
    if (file && file.path) {
      avatar_url = await cloudinary(file.path);
    }
    const createdGroup = await Group.create({
      super: userid,
      admin: [userid],
      name: group_name,
      description,
      avatar: avatar_url ? avatar_url : "https://www.gravatar.com/avatar/",
    });
    await GroupInfo.create({
      addedby: req.user._id,
      groupname: group_name,
      memberId: req.user._id,
    });
    await fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(`Error deleting file ${req.file.path}:`, err);
      } else {
        console.log(`File ${req.file.path} deleted successfully.`);
      }
    });
    return res
      .status(201)
      .json(new ApiResponse(201, "Group Created", createdGroup));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const addMembers = async (req, res) => {
  try {
    const userid = req.user._id;
    const { gname, adduserids = [] } = req.body;

    if (!gname) throw new ApiErrors(401, "Group name is required");
    if (!Array.isArray(adduserids) || adduserids.length === 0) {
      throw new ApiErrors(401, "User IDs to add are required");
    }

    const gdata = await Group.findOne({ name: gname });
    if (!gdata) throw new ApiErrors(401, "Group name is invalid");

    const admins = gdata.admin;
    const isAdmin = admins.some(
      (admin) => admin.toString() === userid.toString()
    );
    if (!isAdmin) throw new ApiErrors(401, "User is not admin of the group");

    // Prepare the documents to be inserted
    const newMembers = adduserids.map((userId) => ({
      memberId: userId,
      groupname: gname,
      addedby: userid,
    }));

    // Bulk insert the new members
    const addedMembers = await GroupInfo.insertMany(newMembers);

    res
      .status(200)
      .json({ message: "Members added successfully", addedMembers });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const removeMembers = async (req, res) => {
  try {
    const userid = req.user._id;
    const { gname, removeuserids = [] } = req.body;
    if (!gname) throw new ApiErrors(401, "Group name is required");
    if (!Array.isArray(removeuserids) || removeuserids.length == 0)
      throw new ApiErrors(401, "No Id remove");
    const gdata = await Group.findOne({ name: gname });
    if (!gdata) throw new ApiErrors(401, "Group name is invalid");
    const admins = gdata.admin;
    const isAdmin = admins.filter(
      (admin) => admin.toString() === userid.toString()
    );
    if (!isAdmin.length >= 1)
      throw new ApiErrors(401, "User is not admin of the group");

    const removedUser = await GroupInfo.deleteMany({
      $and: [
        { groupname: gname },
        {
          memberId: { $in: removeuserids },
        },
      ],
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Member removed succesfully", true));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const updateGroup = async (req, res) => {
  try {
    const groupname = req.params.gname;
    const group = await Group.findOne({ name: groupname });
    const { gname, gdescription } = req.body;
    const userid = req.user._id;
    if (!group.admin.some((gaid) => gaid.toString() === userid))
      throw new ApiErrors(401, "Admin Permission required.");
    if (gname) {
      group.name = gname;
    }
    if (gdescription) group.description = gdescription;
    let avatar_url;
    if (req.file.path) avatar_url = await cloudinary(req.file.path);
    if (avatar_url) group.avatar = avatar_url;
    await group.save({ validateBeforeSave: true });
    await fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(`Error deleting file ${data.localpath}:`, err);
      } else {
        console.log(`File ${data.localpath} deleted successfully.`);
      }
    });
    return res.status(201).json(new ApiResponse(201, "Group Updated"));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const addAdmin = async (req, res) => {
  try {
    const gname = req.params.gname;
    const group = await Group.findOne({ name: gname });
    const { userids = [] } = req.body;
    if (!Array.isArray(userids) || userids.length === 0)
      throw new ApiErrors(401, "User IDs are required.");
    const admins = group.admin.map((ga) => ga.toString());
    if (!admins.some((admin) => admin === req.user._id.toString()))
      throw new ApiErrors(401, "Admin Permissions required");
    userids.forEach((userid) => {
      if (!admins.includes(userid)) {
        group.admin.push(userid);
      }
    });
    await group.save();

    return res
      .status(200)
      .json({ message: "Admins added successfully", admins: group.admin });
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const removeAdmin = async (req, res) => {
  try {
    const groupname = req.params.gname;
    const { admins_ids = [] } = req.body;
    const userid = req.user._id;
    if (!Array.isArray(admins_ids) || admins_ids.length === 0)
      throw new ApiErrors(401, "Admin IDS are required");
    const group = await Group.findOne({ name: groupname });
    if (!userid === group.super.toString())
      throw new ApiErrors(401, "Super Admin Perms required");
    group.admin = group.admin.filter((ai) => {
      return !admins_ids.includes(ai.toString());
    });
    if (!group.admin.includes(group.super)) group.admin.push(group.super);
    await group.save();
    return res.status(201).json(new ApiResponse(201, "Admins Removed", true));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

const deleteGroup = async (req, res) => {
  try {
    const gname = req.params.gname;
    const userid = req.user._id;
    const group = await Group.findOne({ name: gname });
    if (!userid.toString() === group.super.toString())
      throw new ApiErrors(401, "Super Admin permission required");
    await GroupInfo.deleteMany({
      groupname: gname,
    });
    await Group.deleteOne({ name: gname });
    return res.status(201).json(new ApiResponse(201, "Group Deleted", true));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new ApiResponse(
          error.statusCode || 401,
          error.message || "Error While saving contact"
        )
      );
  }
};

module.exports = {
  createGroups,
  addAdmin,
  addMembers,
  removeMembers,
  updateGroup,
  removeAdmin,
  deleteGroup,
};
