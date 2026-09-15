-- Add ticket_link column to events table
ALTER TABLE events ADD COLUMN ticket_link TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN events.ticket_link IS 'External URL for ticket purchase or event registration (e.g., Ticketmaster, Eventbrite, or internal ticketing link)';
