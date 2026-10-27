# 273223010

<!-- Exercise 2. Write the non-goals first. Every acceptance criterion must be checkable in under a minute.
     Keep these headings exactly as they are: the self-checks look for them by name.
     The full target is on the course site under Resources → The course project. -->

## Project option
Club events.

## Goals
- A member signs in, sees upcoming club events and registers for one that has free places available.
- An organizer creates a new event with a capacity limit and views the list of registered members.

## Non-goals
- No payments: every club event is completely free of charge.
- No email or push notifications: members check the website manually for updates.
- No dedicated mobile app: a responsive web UI is used that also works on mobile screens.

## Constraints
- Node.js with Express, PostgreSQL database, plain HTML and JavaScript in the UI.
- Passwords are stored only as a secure hash and never as readable plain text.

## The model feature
<!-- Which model, which modality, and what it does for a user.
     Name three things or the check fails: the input it receives, the output it produces,
     and what happens when the model is slow, rate-limited or wrong. -->
- Model: Gemini 2.5 Flash, vision, called exclusively from the poster processing service.
- Input: An event poster image uploaded by an organizer.
- Output: Suggested title, date, and location fields populated automatically in the event creation form.
- When it fails: If the model is slow, rate-limited, or returns invalid data, a fallback message is shown and the organizer can fill out the form manually.

## Auth
<!-- Local sign-in plus at least one provider. Say how an account signing in both ways stays one account. -->
- Local: Email and password authentication with securely hashed passwords.
- Provider: Google OAuth for social login.
- Linking: Accounts with the same verified email address are automatically linked together into a single user account.

## MCP tools
<!-- At least three tools your own MCP server exposes over this project's data.
     Each tool calls the same service functions the HTTP API calls, so the same rules apply.
     A description shorter than 20 characters is not a description. -->
| Tool | What it does | Who may call it |
| --- | --- | --- |
| `find_event` | Searches for club events by keyword, title, or date to help users discover relevant activities. | Any authenticated member |
| `get_event_attendees` | Retrieves the list of members registered for a specific club event to check capacity. | Event organizers and admins |
| `recommend_events` | Suggests upcoming events to a user based on their past event participation history. | Any authenticated member |

## UI
<!-- Stack, and the three or more screens. The graded checklist lives in docs/UI.md. -->
- Stack: Server-rendered HTML with plain JavaScript enhancements and CSS styling.
- Screens: Login/Register screen, Upcoming Events list screen, Event Details screen, and Organizer Event Creation screen.

## Architecture
<!-- Exercise 3. One request traced through every layer, naming the file for each one,
     plus one place where your own code does not match this layering. -->
- Trace layer: HTTP request -> Router -> Service -> Database.

## Acceptance criteria
<!-- Every criterion carries an id. A test proves it by naming that id in its title, for example
     test('AC-3 a booking that overlaps another is refused with 409', ...).
     Say who acts, what they see, and what must be true in the database. -->
- [AC-1] A member who signs up for an event with no free places sees "This event is full", and no new row appears in `registrations`.
- [AC-2] A visitor who opens the events page without signing in is automatically redirected to the login page.
- [AC-3] An organizer successfully creates a new event by filling out the title, date, and capacity fields, which then appears immediately on the main events list.
- [AC-4] A registered member can cancel their event registration, which frees up a slot and updates the available place count.
- [AC-5] Entering an incorrect password during local sign-in displays an invalid credentials error and denies access.
- [AC-6] Clicking the social login button redirects the user to the OAuth provider and completes authentication successfully upon approval.
- [AC-7] Deleting an event row directly from the database removes that event from the active UI list upon reloading.
- [AC-8] Submitting an event creation form with missing required fields displays validation error messages for each empty field.

### Slice 1: sign-in and upcoming events list
- [AC-9] A visitor who opens `/events` without signing in lands on `/login` instead.
- [AC-10] After signing in with a seeded account, `/events` shows the seeded events, each displaying its title, date, and remaining free places.
- [AC-11] Deleting one event row in the database and reloading `/events` removes that specific event from the screen.

## Traceability
<!-- Filled in from Exercise 3 onward: each AC id, and the test that names it. -->
| Criterion | Test |
| --- | --- |
| AC-1 | Pending |

## Spec vs result
<!-- After the agent builds the slice: which criteria passed, which it missed or reinterpreted, and what you changed in this spec because of it. -->
- The agent may initially attempt to add unnecessary client-side frameworks or complex state management libraries; these will be stripped down to plain HTML and JavaScript to match project constraints.