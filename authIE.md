# Authentication & Application Structure Guide

## Company Branding - MIFECO

### Brand Identity
- **Company Name**: MIFECO (Mars Technology Institute affiliate)
- **Color Palette**:
  - M: #FF6B6B (Red)
  - I: #4ECDC4 (Teal)
  - F: #FFE66D (Yellow)
  - E: #95E1D3 (Mint)
  - C: #F38181 (Pink)
  - O: #AA96DA (Purple)
- **Typography**: Space Grotesk font family
- **Visual Style**: Modern, tech-forward, dark theme with neon accents

### Dark Theme Color System
```css
--background-color: #0a0a1a (Deep navy/black)
--primary-text: #e0e0e0 (Light gray)
--secondary-text: #a0a0b0 (Medium gray)
--accent-color: #00f2ff (Cyan/neon blue)
--card-background: #1a1a2a (Dark blue-gray)
--border-color: #33334a (Subtle borders)
--success-color: #00ffaa (Neon green)
--error-color: #ff4d4d (Bright red)
```

---

## Authentication System

### Sign Up Flow

#### User Registration
1. **Form Fields**:
   - Username (text input)
   - Email (email input with validation)
   - Password (password input with visibility toggle)

2. **Validation Rules**:
   - Username: Required, unique
   - Email: Required, valid format, unique
   - Password: Required, minimum length recommended

3. **Backend Process**:
   - Check for existing username/email in database
   - Store user credentials (password should be hashed in production)
   - Assign default project/usage limit (e.g., 3 free items)
   - Create user record with:
     - Unique user ID
     - Username
     - Email
     - Hashed password
     - Project/usage limit
     - Current usage count (starts at 0)
     - Registration timestamp

4. **Success Response**:
   - Return user object (without password)
   - Automatically log user in
   - Redirect to main application

5. **Error Handling**:
   - Display clear error messages
   - "User already exists" for duplicate username/email
   - Network error handling

### Sign In Flow

#### User Login
1. **Form Fields**:
   - Email (email input)
   - Password (password input)

2. **Authentication Process**:
   - Query database for user by email
   - Compare provided password with stored password
   - Use constant-time comparison to prevent timing attacks

3. **Success Response**:
   - Return user object with:
     - User ID
     - Username
     - Email
     - Current usage limits
     - Current usage count
   - Store user session in localStorage
   - Redirect to main application

4. **Error Handling**:
   - Generic "Invalid credentials" message (don't reveal if email exists)
   - Account lockout after multiple failed attempts (optional)

### Password Reset Flow

#### Request Reset
1. **User enters email address**
2. **Backend Process**:
   - Check if email exists in database
   - Generate secure random token (32 bytes hex)
   - Store token with expiration (1 hour) in tokens table
   - Send email with reset link containing token
   - Always return success message (don't reveal if email exists)

3. **Email Template**:
   - Subject: "Password Reset Request"
   - Body includes:
     - Reset link with token parameter
     - Expiration time (1 hour)
     - Security notice

#### Confirm Reset
1. **User clicks link with token**
2. **Frontend displays new password form**
3. **Backend Process**:
   - Validate token exists and not expired
   - Update user password
   - Delete used token
   - Send confirmation email

### Account Management

#### Account Deletion
1. **User requests account deletion**
2. **Confirmation modal** with warning about data loss
3. **Backend Process**:
   - Cancel any active subscriptions (Stripe)
   - Delete user from database
   - Clean up associated data
   - Send confirmation email
4. **Frontend**: Log user out and redirect to landing page

---

## Stripe Payment Integration

### Payment Structure

#### Free Trial
- **Initial Limit**: 3 free projects/items/uses
- **No Credit Card Required**: Users can start immediately
- **Counter Tracking**: Backend tracks usage count per user

#### Subscription Tiers

**Basic Plan - $10/month**
- 2 additional items per month
- All features included
- Email support
- Stripe Payment Link: Direct checkout URL

**Pro Plan - $20/month**
- 4 additional items per month
- All features included
- Priority support
- Stripe Payment Link: Direct checkout URL

**Unlimited Plan - $100/month**
- Unlimited items
- All features included
- Priority support
- Stripe Payment Link: Direct checkout URL

### Implementation Approach

#### Simplified Stripe Integration
1. **No Complex Stripe SDK**: Use direct payment links
2. **Payment Links**:
   - Each plan has a unique Stripe payment link
   - Links open in new tab/window
   - User completes payment on Stripe's hosted page

3. **Webhook Handling** (Optional):
   - Stripe sends webhook on successful payment
   - Backend updates user's subscription tier
   - Updates usage limits in database

4. **Manual Verification** (Alternative):
   - User emails receipt
   - Admin manually upgrades account
   - Simpler for MVP/small scale

### Usage Limit Enforcement

#### Frontend Checks
1. **Before Creating New Item**:
   - Fetch current user limits from backend
   - Check: `currentCount >= limit`
   - If at limit: Show upgrade modal
   - If under limit: Allow creation

2. **Upgrade Modal Display**:
   - Show current usage (e.g., "3/3 projects used")
   - Display all three plan options
   - Each plan has "Choose" button linking to Stripe
   - Cancel button to close modal

#### Backend Tracking
1. **On Item Creation**:
   - Increment user's usage count
   - API endpoint: `POST /api/user/:userId/increment-projects`

2. **On Item Deletion**:
   - Decrement user's usage count
   - API endpoint: `POST /api/user/:userId/decrement-projects`

3. **Get Current Limits**:
   - API endpoint: `GET /api/user/:userId/limits`
   - Returns: `{ projectLimit: number, projectCount: number }`

---

## Landing Page Structure

### Hero Section

#### Layout
- **Full viewport height** on first load
- **Centered content** with vertical alignment
- **Call-to-action** prominently displayed

#### Content Elements
1. **Main Headline**:
   - Large, bold text (2.5-3rem)
   - Describes core value proposition
   - Uses accent color for emphasis

2. **Subheadline**:
   - Secondary text (1.2rem)
   - Elaborates on main benefit
   - Uses secondary text color

3. **Primary CTA Button**:
   - "Get Started" or "Start Free Trial"
   - Large, prominent button
   - Accent color background
   - Opens sign-up modal or navigates to auth

4. **Visual Elements**:
   - Optional: Animated background
   - Optional: Product screenshot/mockup
   - Optional: Icon or logo

### Features Section

#### Grid Layout
- **Responsive grid**: 3-4 columns on desktop, 1-2 on mobile
- **Card-based design**: Each feature in its own card
- **Consistent spacing**: Gap between cards (1.5-2rem)

#### Feature Card Structure
1. **Icon/Emoji**: Visual representation (2.5rem size)
2. **Feature Title**: Bold heading (1.25rem)
3. **Description**: Brief explanation (0.95rem)
4. **Hover Effect**: Subtle lift and shadow on hover

#### Content Pattern
- 6-8 key features
- Focus on benefits, not technical details
- Use action-oriented language
- Keep descriptions concise (2-3 lines max)

### How It Works Section

#### Instructional List
- **Numbered or bulleted list**
- **Step-by-step process**
- **Clear, actionable language**

#### List Item Structure
1. **Bold Title**: Action or step name
2. **Description**: What happens in this step
3. **Visual Indicator**: Number, icon, or checkmark

#### Content Guidelines
- 5-8 steps maximum
- Start each with strong verb
- Explain user benefit in each step
- Progressive disclosure (simple → complex)

### Project/Item Display Section

#### Grid Layout (if user has items)
- **Responsive grid**: 3 columns desktop, 1-2 mobile
- **Card-based**: Each item in clickable card
- **Hover effects**: Lift and shadow on hover

#### Card Content
1. **Item Title**: Bold, prominent
2. **Metadata**: Type, date, status
3. **Action Buttons**: Open, Delete
4. **Visual Indicator**: Status color or icon

#### Empty State (no items)
- **Centered message**: "No items yet"
- **CTA Button**: "Create Your First Item"
- **Helpful text**: Brief explanation of what to do

### Recently Viewed Section

#### Horizontal Scroll or Grid
- **Quick access** to recent items
- **Smaller cards** than main grid
- **Limited to 4-6 items**

#### Card Content
- Item title
- Last viewed timestamp
- Quick open button

### My Work View (if applicable)

#### Task/Assignment Dashboard
- **Personalized view**: Items assigned to current user
- **Grouped by project/category**
- **Status indicators**: Todo, In Progress, Done
- **Quick actions**: Mark complete, view details

### Footer Section

#### Content Elements
1. **Company Branding**:
   - MIFECO name with colored letters
   - Copyright notice
   - Year

2. **Links** (optional):
   - Terms of Service
   - Privacy Policy
   - Contact information
   - Social media links

3. **Support Elements**:
   - Help button (floating action button)
   - Contact email
   - Documentation link

---

## Modal System

### Authentication Modal

#### Tabbed Interface
- **Two tabs**: "Sign In" and "Sign Up"
- **Active tab indicator**: Accent color underline
- **Smooth transitions**: Between tabs

#### Modal Structure
1. **Overlay**: Semi-transparent dark background
2. **Content Card**: Centered, max-width 500px
3. **Close Button**: X in top-right corner
4. **Form Area**: Scrollable if needed
5. **Action Buttons**: Bottom-aligned

### Upgrade Modal

#### Layout
- **Centered modal**: Max-width 700px
- **Three-column grid**: One per plan
- **Highlighted plan**: Border on recommended option

#### Plan Card Structure
1. **Plan Name**: Bold heading
2. **Price**: Large, prominent ($XX/mo)
3. **Features List**: Bulleted benefits
4. **CTA Button**: "Choose [Plan Name]"
5. **Visual Hierarchy**: Recommended plan stands out

#### Content
- Current usage display: "You've reached your limit (X/Y)"
- Clear explanation of what each plan includes
- Consistent button styling
- Cancel/close option

### Confirmation Modals

#### Delete Confirmation
- **Warning message**: Clear consequences
- **Item name**: What will be deleted
- **Two buttons**: Cancel (default) and Confirm Delete (danger)
- **Red color scheme**: For destructive action

---

## Navigation Structure

### Header Component

#### Layout
- **Fixed position**: Stays at top on scroll
- **Full width**: Spans viewport
- **Flex layout**: Space between elements

#### Elements (Authenticated)
1. **Logo/Brand**: Left side, clickable to home
2. **Navigation Items**: Center or left
   - Home/Dashboard
   - New Item button
3. **User Menu**: Right side
   - Username display
   - Notifications bell (if applicable)
   - Account settings
   - Logout button

#### Elements (Unauthenticated)
1. **Logo/Brand**: Left side
2. **CTA Buttons**: Right side
   - Sign In
   - Get Started

### Help System

#### Floating Action Button (FAB)
- **Position**: Fixed bottom-right
- **Icon**: Question mark (?)
- **Circular button**: 50px diameter
- **Accent color**: Stands out
- **Hover effect**: Slight scale increase

#### Help Modal
- **Full documentation**: Markdown-formatted
- **Scrollable content**: Max-height 80vh
- **Sections**: Organized by topic
- **Search functionality** (optional)

---

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
1. **Navigation**: Hamburger menu
2. **Grids**: Single column
3. **Modals**: Full-width on small screens
4. **Font sizes**: Slightly smaller
5. **Spacing**: Reduced padding/margins
6. **Touch targets**: Minimum 44px

### Tablet Adaptations
1. **Grids**: 2 columns
2. **Modals**: 90% width
3. **Navigation**: Condensed but visible

---

## State Management

### User Session
- **Storage**: localStorage
- **Key**: `hmap-user-session` or similar
- **Data**: User object (no password)
- **Persistence**: Across page reloads

### Application State
- **Projects/Items**: localStorage per user
- **Key Pattern**: `hmap-items-${userId}`
- **Sync**: BroadcastChannel for multi-tab

### Recently Viewed
- **Storage**: localStorage
- **Key**: `hmap-recently-viewed-${userId}`
- **Limit**: 4-6 items
- **Update**: On item open

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/confirm-reset-password` - Complete password reset
- `DELETE /api/auth/delete-account/:userId` - Delete user account

### User Limits
- `GET /api/user/:userId/limits` - Get current usage limits
- `POST /api/user/:userId/increment-projects` - Increase usage count
- `POST /api/user/:userId/decrement-projects` - Decrease usage count

### Email
- `POST /api/send-email` - Send email via AWS SES

### Stripe (Optional)
- `POST /api/stripe/webhook` - Handle Stripe webhooks

---

## Database Schema

### Users Table
```javascript
{
  id: string,              // Unique user ID
  username: string,        // Display name
  email: string,           // Login email (unique)
  password: string,        // Hashed password
  projectLimit: number,    // Max items allowed (-1 = unlimited)
  projectCount: number,    // Current usage count
  createdAt: timestamp,    // Registration date
  subscriptionTier: string // 'free', 'basic', 'pro', 'unlimited'
}
```

### Reset Tokens Table
```javascript
{
  token: string,           // Random hex token (primary key)
  userId: string,          // Associated user
  expiresAt: number,       // Timestamp for expiration
  createdAt: timestamp     // When token was created
}
```

---

## Security Best Practices

### Password Handling
- **Never store plain text passwords**
- **Use bcrypt or similar** for hashing
- **Minimum password length**: 8 characters
- **Password strength indicator** (optional)

### Token Security
- **Cryptographically random tokens**: crypto.randomBytes(32)
- **Short expiration**: 1 hour for reset tokens
- **Single use**: Delete token after use
- **Constant-time comparison**: Prevent timing attacks

### API Security
- **CORS configuration**: Whitelist frontend domain
- **Rate limiting**: Prevent brute force attacks
- **Input validation**: Sanitize all user inputs
- **HTTPS only**: In production

### Session Management
- **Secure storage**: localStorage for non-sensitive data
- **Session timeout**: Optional auto-logout
- **Multi-tab sync**: BroadcastChannel API

---

## Email Templates

### Welcome Email
- Subject: "Welcome to [App Name]"
- Personalized greeting
- Quick start guide
- Support contact information

### Password Reset Email
- Subject: "Password Reset Request"
- Reset link with token
- Expiration notice (1 hour)
- Security warning (didn't request? ignore)

### Account Deletion Confirmation
- Subject: "Account Deleted"
- Confirmation of deletion
- Data removal notice
- Feedback request (optional)

### Payment Confirmation
- Subject: "Payment Received - [Plan Name]"
- Thank you message
- Plan details and benefits
- Receipt/invoice information

---

## Error Handling

### User-Facing Messages
- **Clear and concise**: Avoid technical jargon
- **Actionable**: Tell user what to do next
- **Friendly tone**: Not accusatory
- **Specific**: "Email already exists" not "Error 400"

### Error States
1. **Network errors**: "Connection lost. Please try again."
2. **Validation errors**: "Please enter a valid email address."
3. **Authentication errors**: "Invalid credentials. Please try again."
4. **Limit reached**: "You've reached your limit. Upgrade to continue."
5. **Server errors**: "Something went wrong. Please try again later."

### Loading States
- **Spinners**: For async operations
- **Disabled buttons**: During submission
- **Progress indicators**: For multi-step processes
- **Skeleton screens**: For content loading

---

## Accessibility

### ARIA Labels
- **Buttons**: Descriptive labels
- **Form inputs**: Associated labels
- **Modals**: role="dialog", aria-modal="true"
- **Navigation**: Semantic HTML elements

### Keyboard Navigation
- **Tab order**: Logical flow
- **Focus indicators**: Visible outlines
- **Escape key**: Close modals
- **Enter key**: Submit forms

### Color Contrast
- **WCAG AA compliance**: Minimum 4.5:1 ratio
- **Text on backgrounds**: High contrast
- **Interactive elements**: Clear visual states

### Screen Reader Support
- **Semantic HTML**: Use proper elements
- **Alt text**: For images and icons
- **Status messages**: Announced to screen readers

---

## Performance Optimization

### Loading Strategy
- **Code splitting**: Lazy load routes
- **Image optimization**: Compress and resize
- **Font loading**: Subset and preload
- **Caching**: Service workers (optional)

### Bundle Size
- **Tree shaking**: Remove unused code
- **Minification**: Compress production builds
- **Gzip compression**: Server-level
- **CDN delivery**: For static assets

### Runtime Performance
- **React optimization**: useMemo, useCallback
- **Virtual scrolling**: For long lists
- **Debouncing**: For search/filter inputs
- **Lazy loading**: For images and components

---

## Deployment Checklist

### Frontend (S3 + CloudFront)
- [ ] Build production bundle
- [ ] Upload to S3 bucket
- [ ] Configure bucket for static hosting
- [ ] Set up CloudFront distribution
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS

### Backend (Lambda + API Gateway)
- [ ] Package Lambda function with dependencies
- [ ] Deploy to AWS Lambda
- [ ] Configure API Gateway endpoints
- [ ] Set environment variables
- [ ] Enable CORS
- [ ] Set up custom domain (optional)

### Database (DynamoDB)
- [ ] Create Users table
- [ ] Create Tokens table
- [ ] Set up indexes
- [ ] Configure backup policy

### Email (AWS SES)
- [ ] Verify sender email
- [ ] Move out of sandbox (for production)
- [ ] Create email templates
- [ ] Test email delivery

### Monitoring
- [ ] Set up CloudWatch logs
- [ ] Configure error alerts
- [ ] Monitor API usage
- [ ] Track user metrics

---

## Testing Strategy

### Manual Testing
- [ ] Sign up flow
- [ ] Sign in flow
- [ ] Password reset flow
- [ ] Create item (under limit)
- [ ] Create item (at limit - should show upgrade)
- [ ] Upgrade modal displays correctly
- [ ] Stripe links open correctly
- [ ] Account deletion works
- [ ] Responsive design on mobile
- [ ] Cross-browser compatibility

### Automated Testing (Optional)
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## Future Enhancements

### Phase 2 Features
- Social authentication (Google, GitHub)
- Team/organization accounts
- Usage analytics dashboard
- Export/import functionality
- API access for integrations

### Scalability Considerations
- Database migration to RDS (if needed)
- Redis caching layer
- CDN for global distribution
- Load balancing for high traffic
- Microservices architecture (if needed)

---

## Support & Documentation

### User Documentation
- Getting started guide
- Feature tutorials
- FAQ section
- Video walkthroughs
- Troubleshooting guide

### Developer Documentation
- API reference
- Database schema
- Architecture diagrams
- Deployment guide
- Contributing guidelines

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Company**: MIFECO (Mars Technology Institute)  
**Purpose**: Template for building authenticated web applications with Stripe integration
