  const express = require('express');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const Flex_Muscle = require('./Model/Flex-Muscle');
  const Cardio = require('./Model/Cardio');
  const Basic_Yoga = require('./Model/Basic-Yoga');
  const dotenv = require('dotenv');
  const cloudinary = require('cloudinary').v2;
  const fileupload =require('express-fileupload');
  // Load environment variables from .env file
  dotenv.config();
  
const allowedOrigins = [ /^http:\/\/localhost:\d+/];

  const mongoString = process.env.MONGO_URI || 'mongodb+srv://nilesh:nilesh@cluster0.9kjifj3.mongodb.net/Fitness';
  
  mongoose.connect(mongoString, { useNewUrlParser: true, useUnifiedTopology: true });
  const database = mongoose.connection;
  
  database.on('error', (error) => {
      console.log(error);
  });
  
  database.once('connected', () => {
      console.log('Database Connected');
  });
  
  const app = express();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(cors({
    origin: /^http:\/\/localhost:\d+/,
    credentials:true
}))
  app.use(express.json());
  app.use(fileupload());
  cloudinary.config({
    cloud_name:'dilnheszb',
    api_key: 541297151113615,
    api_secret:'UZB7vfIpu381Jr4tSosL-xxJRL4'

  });
  
  // Flex Muscle routes
  app.post('/Flex_Muscle', async (req, res) => {
      try {
          const { name, sets, reps, image, duration } = req.body;
          if (!name || !sets || !reps || !image || !duration) {
            return res.status(400).send({ error: 'All fields are required' });
        }
  
          // Upload image to Cloudinary
          const result = await cloudinary.uploader.upload(image, {
              folder: 'Flex-Muscle',
          });
  
          // Save exercise with image URL to database
          const Flex_Muscle_Exercise = new Flex_Muscle({
              name,
              sets,
              reps,
              duration,
              image: result.secure_url,
              image_id: result.public_id    
          });
  
          await Flex_Muscle_Exercise.save();
          res.status(201).send(Flex_Muscle_Exercise);
      } catch (error) {
          console.error(error);
          res.status(400).send(error);
      }
  });
  
  app.get('/Flex_Muscle', async (req, res) => {
      try {
          const exercises = await Flex_Muscle.find();
          res.send(exercises);
      } catch (err) {
          res.status(500).send(err);
      }
  });
  app.get('/Flex_Muscle/:id', async (req, res) => {
    try {
        const exercise = await Flex_Muscle.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.json(exercise);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
  
app.put('/Flex_Muscle/edit/:id', async (req, res) => {
    try {
      const { name, sets, reps, duration, image } = req.body;
      
      // Check if all required fields are provided
      if (!name || !sets || !reps || !duration) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Find the exercise by ID
      const exercise = await Flex_Muscle.findById(req.params.id);
    
      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
  
      // If a new image is provided, upload it to Cloudinary
      let imageUrl = exercise.image;
      let imageId = exercise.image_id;
      if (image) {
        // Destroy the old image on Cloudinary
        await cloudinary.uploader.destroy(exercise.image_id);
        
        // Upload the new image to Cloudinary
        const result = await cloudinary.uploader.upload(image, { folder: 'Flex-Muscle' });
        imageUrl = result.secure_url;
        imageId = result.public_id;
      }
    
      // Update exercise details
      exercise.name = name;
      exercise.sets = sets;
      exercise.reps = reps;
      exercise.duration = duration;
      exercise.image = imageUrl;
      exercise.image_id = imageId;
    
      // Save the updated exercise
      await exercise.save();
    
      res.json(exercise);
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  
  app.delete('/Flex_Muscle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete request for exercise ID:', id);

        const exercise = await Flex_Muscle.findById(id);
        if (!exercise) {
            console.log('Exercise not found for ID:', id);
            return res.status(404).send({ error: 'Exercise not found' });
        }

        const imageUrlParts = exercise.image.split('/');
        const publicIdWithExtension = imageUrlParts[imageUrlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        console.log('Public ID for Cloudinary deletion:', publicId);

        await cloudinary.uploader.destroy(`Flex-Muscle/${publicId}`);
        console.log('Cloudinary deletion successful');

        await Flex_Muscle.findByIdAndDelete(id);
        console.log('Database deletion successful');

        res.status(200).send({ message: 'Exercise and image deleted successfully' });
    } catch (error) {
        console.error('Error during deletion:', error);
        res.status(500).send({ error: 'An error occurred while deleting the exercise' });
    }
});

  
  // Cardio routes
  app.post('/Cardio', async (req, res) => {
      try {
          const { name, sets, reps, image, duration } = req.body;
  
          if (!name || !sets || !reps || !image || !duration) {
              return res.status(400).send({ error: 'All fields are required' });
          }
  
          // Upload image to Cloudinary
          const result = await cloudinary.uploader.upload(image, {
              folder: 'Cardio'
          });
  
          // Save exercise with image URL to database
          const Cardio_Exercise = new Cardio({
              name,
              sets,
              reps,
              duration,
              image: result.secure_url,
              image_id: result.public_id
          });
  
          await Cardio_Exercise.save();
          res.status(201).send(Cardio_Exercise);
      } catch (error) {
          console.error('Error uploading image or saving exercise:', error);
          res.status(400).send({ error: error.message });
      }
  });
  
  app.get('/Cardio', async (req, res) => {
      try {
          const exercises = await Cardio.find();
          res.send(exercises);
      } catch (err) {
          res.status(500).send(err);
      }
  });
  
  app.get('/Cardio/:id', async (req, res) => {
    try {
        const exercise = await Cardio.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.json(exercise);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

  app.put('/Cardio/:id', async (req, res) => {
    try {
      const { name, sets, reps, duration, image } = req.body;
      
      // Check if all required fields are provided
      if (!name || !sets || !reps || !duration) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Find the exercise by ID
      const exercise = await Cardio.findById(req.params.id);
    
      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
  
      // If a new image is provided, upload it to Cloudinary
      let imageUrl = exercise.image;
      let imageId = exercise.image_id;
      if (image) {
        // Destroy the old image on Cloudinary
        await cloudinary.uploader.destroy(exercise.image_id);
        
        // Upload the new image to Cloudinary
        const result = await cloudinary.uploader.upload(image, { folder: 'Cardio' });
        imageUrl = result.secure_url;
        imageId = result.public_id;
      }
    
      // Update exercise details
      exercise.name = name;
      exercise.sets = sets;
      exercise.reps = reps;
      exercise.duration = duration;
      exercise.image = imageUrl;
      exercise.image_id = imageId;
    
      // Save the updated exercise
      await exercise.save();
    
      res.json(exercise);
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/Cardio/:id',async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete request for exercise ID:', id);

        const exercise = await Cardio.findById(id);
        if (!exercise) {
            console.log('Exercise not found for ID:', id);
            return res.status(404).send({ error: 'Exercise not found' });
        }

        const imageUrlParts = exercise.image.split('/');
        const publicIdWithExtension = imageUrlParts[imageUrlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        console.log('Public ID for Cloudinary deletion:', publicId);

        await cloudinary.uploader.destroy(`Cardio/${publicId}`);
        console.log('Cloudinary deletion successful');

        await Cardio.findByIdAndDelete(id);
        console.log('Database deletion successful');

        res.status(200).send({ message: 'Exercise and image deleted successfully' });
    } catch (error) {
        console.error('Error during deletion:', error);
        res.status(500).send({ error: 'An error occurred while deleting the exercise' });
    }
});
  
  // Basic Yoga routes
  app.post('/Basic_Yoga', async (req, res) => {
    try {
        const { name, sets, image, duration } = req.body;

        if (!name || !sets || !image || !duration) {
            return res.status(400).send({ error: 'All fields are required' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: 'Basic-Yoga'
        });

        // Save exercise with image URL to database
        const Basic_Yoga_Exercise = new Basic_Yoga({
            name,
            sets,
            duration,
            image: result.secure_url,
            image_id: result.public_id
        });

        await Basic_Yoga_Exercise.save();
        res.status(201).send(Basic_Yoga_Exercise);
    } catch (error) {
        console.error('Error uploading image or saving exercise:', error);
        res.status(400).send({ error: error.message });
    }
});
  
  app.get('/Basic_Yoga', async (req, res) => {
      try {
          const exercises = await Basic_Yoga.find();
          res.send(exercises);
      } catch (err) {
          res.status(500).send(err);
      }
  });
  
  app.get('/Basic_Yoga/:id', async (req, res) => {
    try {
        const exercise = await Basic_Yoga.findById(req.params.id);
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.json(exercise);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

  
app.put('/Basic_Yoga/:id', async (req, res) => {
    try {
      const { name, sets, duration, image } = req.body;
      
      // Check if all required fields are provided
      if (!name || !sets || !duration) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Find the exercise by ID
      const exercise = await Basic_Yoga.findById(req.params.id);
    
      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
  
      // If a new image is provided, upload it to Cloudinary
      let imageUrl = exercise.image;
      let imageId = exercise.image_id;
      if (image) {
        // Destroy the old image on Cloudinary
        await cloudinary.uploader.destroy(exercise.image_id);
        
        // Upload the new image to Cloudinary
        const result = await cloudinary.uploader.upload(image, { folder: 'Cardio' });
        imageUrl = result.secure_url;
        imageId = result.public_id;
      }
    
      // Update exercise details
      exercise.name = name;
      exercise.sets = sets;
      exercise.duration = duration;
      exercise.image = imageUrl;
      exercise.image_id = imageId;
    
      // Save the updated exercise
      await exercise.save();
    
      res.json(exercise);
    } catch (error) {
      console.error('Error updating exercise:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.delete('/Basic_Yoga/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Delete request for exercise ID:', id);

        const exercise = await Basic_Yoga.findById(id);
        if (!exercise) {
            console.log('Exercise not found for ID:', id);
            return res.status(404).send({ error: 'Exercise not found' });
        }

        const imageUrlParts = exercise.image.split('/');
        const publicIdWithExtension = imageUrlParts[imageUrlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        console.log('Public ID for Cloudinary deletion:', publicId);

        await cloudinary.uploader.destroy(`Basic-Yoga/${publicId}`);
        console.log('Cloudinary deletion successful');

        await Basic_Yoga.findByIdAndDelete(id); // Changed from Cardio to Basic_Yoga
        console.log('Database deletion successful');

        res.status(200).send({ message: 'Exercise and image deleted successfully' });
    } catch (error) {
        console.error('Error during deletion:', error);
        res.status(500).send({ error: 'An error occurred while deleting the exercise' });
    }
});

  
  const PORT = process.env.PORT || 7000;
  app.listen(PORT, () => {
      console.log(`Server started at ${PORT}`);
  });
  