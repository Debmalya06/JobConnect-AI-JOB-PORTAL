import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Candidate from "../models/Candidate.js";
import Company from "../models/Company.js";

const registerCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    let candidate = await Candidate.findOne({ email });
    if (candidate) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    candidate = new Candidate({ firstName, lastName, email, phone, password: hashedPassword });
    await candidate.save();

    res.status(201).json({ message: "Candidate registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerCompany = async (req, res) => {
  try {
    const { companyName, businessEmail, businessPhone, companyWebsite, password } = req.body;
    let company = await Company.findOne({ businessEmail });
    if (company) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    company = new Company({ companyName, businessEmail, businessPhone, companyWebsite, password: hashedPassword });
    await company.save();

    res.status(201).json({ message: "Company registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    let user;
    
    if (userType === "candidate") {
      user = await Candidate.findOne({ email });
    } else if (userType === "company") {
      user = await Company.findOne({ businessEmail: email });
    }

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Remove password from user object
    const userObject = user.toObject();
    delete userObject.password;

    res.json({ token, user: userObject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const { id, userType } = req.user;
    let user;
    if (userType === "candidate") {
      user = await Candidate.findById(id).select("-password");
    } else if (userType === "company") {
      user = await Company.findById(id).select("-password");
    }
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ user, userType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { registerCandidate, registerCompany, login, getMe };
