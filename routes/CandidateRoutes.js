const express = require("express");
const router = express.Router();
const Candidate = require("../modals/candidate");
const User = require("../modals/users");
const { jwtAuthMiddleWare } = require("../jwt");

const checkAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role == "admin";
  } catch (error) {
    return false;
  }
};

router.post("/", jwtAuthMiddleWare, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id)))
      return res.status(404).json({ message: "Unauthorized" });
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    res
      .status(200)
      .json({ message: "Candidate saved sucessfully", data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/", jwtAuthMiddleWare, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id)))
      return res.status(404).json({ message: "Unauthorized" });
    const candidateId = req.query.candidateid;
    const updatedCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response)
      return res.status(404).json({ message: "Candidate not found" });
    res.status(200).json({ message: "update sucessfull", response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/", jwtAuthMiddleWare, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id)))
      return res.status(404).json({ message: "Unauthorized" });
    const candidateId = req.query.candidateid;
    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response)
      return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "delete sucessfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/vote", jwtAuthMiddleWare, async (req, res) => {
  const candidateId = req.query.candidateId;
  const userId = req.user.id;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVoted)
      return res.status(404).json({ message: "User already voted" });

    if (user.role == "admin")
      return res.status(404).json({ message: "admin not allowed" });

    candidate.voteCount++;
    candidate.votes.push({ user: userId });
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Votting completed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.get("/voteCount", async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({ voteCount: "descending" });
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        vote: data.voteCount,
        name: data.name,
      };
    });

    return res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.get("/", async (req, res) => {
  try {
    const candidateData = await Candidate.find();

    const response = candidateData.map((data) => {
      return {
        id: data.id,
        name: data.name,
        party: data.party,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

module.exports = router;
