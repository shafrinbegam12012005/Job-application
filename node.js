const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON request bodies

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/jobtracker';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Mongoose schema & model
const jobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  applyDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['applied', 'interview', 'offer', 'rejected'],
    default: 'applied'
  },
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// Routes

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ applyDate: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET one job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST (create) a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const { company, position, applyDate, status } = req.body;
    // Basic validation
    if (!company || !position || !applyDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newJob = new Job({
      company,
      position,
      applyDate: new Date(applyDate),
      status
    });
    const saved = await newJob.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request', error: err });
  }
});

// PUT (update) job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { company, position, applyDate, status } = req.body;
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      {
        company,
        position,
        applyDate: applyDate ? new Date(applyDate) : undefined,
        status
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request', error: err });
  }
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Job Application Tracker API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
