const Event = require("../models/event");

// Create Event (Organization only)
exports.createevent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      city,
      eventDate,
      startTime,
      endTime,
      requiredVolunteers,
      requiredSkills,
    } = req.body;

    let parsedSkills = [];
    if (Array.isArray(requiredSkills)) {
      parsedSkills = requiredSkills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof requiredSkills === "string") {
      parsedSkills = requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const event = await Event.create({
      title,
      description,
      category,
      location,
      city: city || req.user.city || "",
      eventDate,
      startTime,
      endTime,
      requiredVolunteers,
      requiredSkills: parsedSkills,
      organization: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my events (organization specific)
exports.getmyevent = async (req, res) => {
  try {
    const events = await Event.find({
      organization: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all events for volunteer/public (with optional category, search & sort filter)
exports.getallevent = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { status: "open" };

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(category, "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { city: searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "soonest") {
      sortOptions = { eventDate: 1 };
    } else if (sort === "urgent") {
      sortOptions = { registeredVolunteers: -1 };
    }

    const events = await Event.find(query)
      .populate("organization", "name city profileImage website description")
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single event by ID
exports.getsingleevent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organization",
      "name city profileImage website description"
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update event for organization
exports.updateevent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own events",
      });
    }

    const {
      title,
      description,
      category,
      location,
      city,
      eventDate,
      startTime,
      endTime,
      requiredVolunteers,
      requiredSkills,
      status,
    } = req.body;

    let updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (location !== undefined) updateFields.location = location;
    if (city !== undefined) updateFields.city = city;
    if (eventDate !== undefined) updateFields.eventDate = eventDate;
    if (startTime !== undefined) updateFields.startTime = startTime;
    if (endTime !== undefined) updateFields.endTime = endTime;
    if (requiredVolunteers !== undefined) updateFields.requiredVolunteers = requiredVolunteers;
    if (status !== undefined) updateFields.status = status;

    if (requiredSkills !== undefined) {
      if (Array.isArray(requiredSkills)) {
        updateFields.requiredSkills = requiredSkills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof requiredSkills === "string") {
        updateFields.requiredSkills = requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    const updatedevent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedevent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete event for organization
exports.deleteevent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own events",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
