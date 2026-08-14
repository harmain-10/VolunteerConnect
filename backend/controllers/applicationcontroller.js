const Application = require("../models/application");
const Event = require("../models/event");

// Applying for events
exports.applyforevent = async (req, res) => {
  // Ensure only volunteers can apply
  if (!req.user || req.user.role !== "volunteer") {
    return res.status(403).json({ success: false, message: "Only volunteers can apply to events" });
  }

  try {
    const { eventid } = req.params;
    const event = await Event.findById(eventid);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "This event is closed",
      });
    }

    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This event has already ended",
      });
    }

    const existingapplication = await Application.findOne({
      volunteer: req.user._id,
      event: eventid,
    });

    if (existingapplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this event",
      });
    }

    const { fullName, email, phone, city, skills, message } = req.body;

    const application = await Application.create({
      volunteer: req.user._id,
      event: eventid,
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      phone: phone || "",
      city: city || req.user.city,
      skills: skills || (req.user.skills ? req.user.skills.join(", ") : ""),
      message: message || "",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Viewing all applications for volunteer
exports.getmyapplication = async (req, res) => {
  try {
    const application = await Application.find({
      volunteer: req.user._id,
    })
      .populate({
        path: "event",
        select: "title location city eventDate startTime endTime category organization status",
        populate: {
          path: "organization",
          select: "name city profileImage website",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: application.length,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Viewing ALL applications for organization across all their events
exports.getorgallapplications = async (req, res) => {
  try {
    const myEvents = await Event.find({ organization: req.user._id });
    const eventIds = myEvents.map((e) => e._id);

    const applications = await Application.find({ event: { $in: eventIds } })
      .populate("event", "title location city eventDate startTime category status")
      .populate("volunteer", "name email city profileImage skills bio")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Viewing application for event (organization)
exports.geteventapplication = async (req, res) => {
  try {
    const { eventid } = req.params;
    const event = await Event.findById(eventid);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ownership check
    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own events",
      });
    }

    const application = await Application.find({
      event: eventid,
    })
      .populate("volunteer", "name email city skills bio profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: application.length,
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Accept application
exports.acceptapplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const event = await Event.findById(application.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ownership check
    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own event applications",
      });
    }

    // Already accepted
    if (application.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Volunteer has already been accepted",
      });
    }

    if (event.registeredVolunteers >= event.requiredVolunteers) {
      return res.status(400).json({
        success: false,
        message: "Event is already full",
      });
    }

    application.status = "accepted";
    event.registeredVolunteers += 1;

    if (event.registeredVolunteers === event.requiredVolunteers) {
      event.status = "closed";
    }

    await application.save();
    await event.save();

    res.status(200).json({
      success: true,
      message: "Volunteer accepted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject application
exports.rejectapplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const event = await Event.findById(application.event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ownership Check
    if (event.organization.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own event applications",
      });
    }

    // Already Rejected
    if (application.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Application already rejected",
      });
    }

    if (application.status === "accepted") {
      event.registeredVolunteers = Math.max(0, event.registeredVolunteers - 1);

      if (event.status === "closed") {
        event.status = "open";
      }

      await event.save();
    }

    application.status = "rejected";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};