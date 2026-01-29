const express = require('express')
const router = express.Router()
const path = require('path')
const WorkExperience = require('../../models/workExperience')
const accomplishmentController = require('../../controller/accomplishment.controller')

// routes/user.js
router.get('/verify-email/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Find the WorkExperience record based on the verification ID
    const workExperience = await WorkExperience.findOne({ user_id: id })

    if (!workExperience) {
      return res.status(404).send('Invalid verification link.')
    }

    if (workExperience.isVerify) {
      return
      // res.send('Your email has already been verified.')
      res.status(404).send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Status</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .message {
        background-color: #1ca919;
        color: white;
        padding: 20px;
        margin: 20px;
        border-radius: 8px;
        font-size: 18px;
        max-width: 600px;
        width: 100%;
        text-align: center;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 10px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #888;
        margin-top: 20px;
      }
      @media (max-width: 600px) {
        .message {
          font-size: 16px;
        }
      }
    </style>
  </head>
  <body>
    <div class="message">
      <h1>Email Status</h1>
      <p>Your email is already verified. Thank you!</p>
    </div>
  </body>
  </html>
`)
    }

    // Render the feedback form
    res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submit Your Feedback</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .form-container {
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 600px;
      }
      h1 {
        color: #00c5ff;
        text-align: center;
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #333;
      }
      input[type="text"], textarea {
        width: 100%;
        padding: 12px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 16px;
        box-sizing: border-box;
      }
      textarea {
        resize: vertical;
        min-height: 100px;
      }
      button {
        background-color: #00c5ff;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        font-size: 16px;
        width: 100%;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #007a99;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #888;
      }

      /* Responsive design for mobile */
      @media (max-width: 600px) {
        .form-container {
          padding: 20px;
        }
        button {
          padding: 12px 16px;
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="form-container">
      <h1>Submit Your Feedback</h1>

      <form action="/api/user/submit-feedback/${id}" method="POST">
        <label for="name">Full Name:</label>
        <input type="text" id="name" name="verificationName" required><br><br>

        <label for="designation">Designation:</label>
        <input type="text" id="designation" name="verificationDesignation" required><br><br>

        <label for="feedback">Feedback:</label>
        <textarea id="feedback" name="verificationFeedback" required></textarea><br><br>

        <button type="submit">Submit</button>
      </form>

      <div class="footer">
        <p>If you have any questions, please contact support.</p>
      </div>
    </div>
  </body>
  </html>
`)
  } catch (err) {
    // console.error('Error finding WorkExperience:', err)
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .message {
            background-color: #d71426;
            color: white;
            padding: 20px;
            margin: 20px;
            border-radius: 8px;
            font-size: 18px;
            max-width: 600px;
            width: 100%;
            text-align: center;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            margin-top: 20px;
          }
          @media (max-width: 600px) {
            .message {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>Email Status</h1>
          <p>Work experience not found. Please try again latter. Thank you</p>
        </div>
      </body>
      </html>
    `)
  }
})

// Route to handle form submission
router.post('/submit-feedback/:id', async (req, res) => {
  const { id } = req.params
  const {
    verificationDesignation,
    verificationName,
    verificationFeedback,
  } = req.body

  // Validate the form data
  if (!verificationDesignation || !verificationName || !verificationFeedback) {
    return res.status(400).send('All fields are required.')
  }

  try {
    // Find the WorkExperience record
    const workExperience = await WorkExperience.findOne({ user_id: id })

    if (!workExperience) {
      // return res.status(404).send('Invalid verification link.')
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid Verification Link</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
      
            .message {
              background-color: #ef8a5a;
              color: white;
              padding: 30px;
              margin: 20px;
              border-radius: 8px;
              font-size: 18px;
              max-width: 600px;
              width: 100%;
              text-align: center;
            }
      
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
      
            p {
              font-size: 16px;
            }
    
            /* Responsive styles */
            @media (max-width: 768px) {
              .message {
                padding: 20px;
                font-size: 16px;
              }
            }
      
            @media (max-width: 600px) {
              .message {
                font-size: 14px;
                padding: 15px;
              }
      
              h1 {
                font-size: 20px;
              }
      
              p {
                font-size: 14px;
              }
      
              .btn {
                padding: 10px 18px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>Error processing feedback</h1>
            <p>Invalid verification link. Please make sure the link is correct or contact support if the problem persists.</p>
          </div>
        </body>
        </html>
      `)
    }

    // Update the record with the feedback and mark it as verified
    workExperience.isVerify = true
    workExperience.verificationDesignation = verificationDesignation
    workExperience.verificationName = verificationName
    workExperience.verificationFeedback = verificationFeedback
    await workExperience.save()

    res.send(`
        <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Feedback Submitted</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              text-align: center;
              padding: 50px;
            }
            .message {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              margin: 20px;
              border-radius: 5px;
              font-size: 18px;
            }
            .btn {
              display: inline-block;
              background-color: #007BFF;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .btn:hover {
              background-color: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>Feedback Submitted Successfully!</h1>
            <p>Your email has been verified, and your feedback has been recorded. Thank you!</p>
          </div>
        </body>
      </html>
    `)
  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Processing Feedback</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
    
          .message {
            background-color: #ef8a5a;
            color: white;
            padding: 30px;
            margin: 20px;
            border-radius: 8px;
            font-size: 18px;
            max-width: 600px;
            width: 100%;
            text-align: center;
          }
    
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
    
          p {
            font-size: 16px;
          }
    
          .btn {
            display: inline-block;
            background-color: #00c5ff;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
    
          .btn:hover {
            background-color: #007a99;
          }
    
          /* Responsive Styles */
          @media (max-width: 768px) {
            .message {
              padding: 25px;
              font-size: 16px;
            }
    
            h1 {
              font-size: 22px;
            }
    
            p {
              font-size: 14px;
            }
          }
    
          @media (max-width: 600px) {
            .message {
              padding: 20px;
              font-size: 14px;
            }
    
            h1 {
              font-size: 20px;
            }
    
            p {
              font-size: 14px;
            }
    
            .btn {
              padding: 10px 18px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>Error Processing Feedback</h1>
          <p>Please try again after some time. If the problem persists, contact support.</p>
          <a href="/" class="btn">Go to Homepage</a>
        </div>
      </body>
      </html>
    `)
  }
})

module.exports = router
