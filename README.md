 <!-- how validation works using Joi-->

<!-- Client sends request
        ↓
Joi validates ONLY what client is allowed to send
        ↓
Auth middleware adds candidateId
        ↓
Controller combines data
        ↓
Mongoose validates + saves to DB -->
