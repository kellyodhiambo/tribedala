-- Create tickets table for events
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "General Admission", "VIP"
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity_available INT NOT NULL DEFAULT 0,
  quantity_sold INT NOT NULL DEFAULT 0,
  start_sale_date TIMESTAMP WITH TIME ZONE,
  end_sale_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_orders table to track purchases
CREATE TABLE IF NOT EXISTS ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  quantity INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment info
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  intasend_request_id VARCHAR(255), -- IntaSend request ID
  intasend_transaction_id VARCHAR(255), -- IntaSend transaction ID
  payment_method VARCHAR(50), -- card, mpesa, bank_transfer
  
  -- Additional info
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_active ON tickets(is_active);
CREATE INDEX idx_ticket_orders_ticket_id ON ticket_orders(ticket_id);
CREATE INDEX idx_ticket_orders_user_id ON ticket_orders(user_id);
CREATE INDEX idx_ticket_orders_payment_status ON ticket_orders(payment_status);
CREATE INDEX idx_ticket_orders_intasend_request_id ON ticket_orders(intasend_request_id);
CREATE INDEX idx_ticket_orders_created_at ON ticket_orders(created_at DESC);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets (read-only for authenticated users)
CREATE POLICY "Anyone can view active tickets"
  ON tickets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Event organizers can view all tickets"
  ON tickets FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can update their tickets"
  ON tickets FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE organizer_id = auth.uid()
    )
  );

-- RLS Policies for ticket_orders
CREATE POLICY "Users can view their own orders"
  ON ticket_orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create ticket orders"
  ON ticket_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own orders"
  ON ticket_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view orders for their tickets"
  ON ticket_orders FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM tickets WHERE event_id IN (
        SELECT id FROM events WHERE organizer_id = auth.uid()
      )
    )
  );

-- Trigger to update ticket updated_at
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- Trigger to update ticket_orders updated_at
CREATE OR REPLACE FUNCTION update_ticket_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_orders_updated_at
  BEFORE UPDATE ON ticket_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_orders_updated_at();
