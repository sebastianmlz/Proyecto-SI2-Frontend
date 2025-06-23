export interface DeliveryAssignment {
  id: number;
  delivery: number;
  delivery_data: {
    order_id: number;
    recipient_name: string;
    recipient_phone: string;
    address_line1: string;
    address_line2: string;
    city: number;
    city_data: {
      id: number;
      name: string;
      state: number;
    };
    state: number;
    state_data: {
      id: number;
      name: string;
      code: string;
      country: number;
    };
    country: number;
    country_data: {
      id: number;
      name: string;
      code: string;
    };
    postal_code: string;
    delivery_status: string;
    status_display: string;
    estimated_arrival: string | null;
    actual_delivery_date: string | null;
    delivery_notes: string;
    full_address: string;
  };
  delivery_person: number;
  delivery_person_data: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone: string | null;
    active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    loyalty: {
      user: number;
      tier: string;
      total_orders: number;
      total_spent: string;
      points: number;
      last_order_date: string | null;
      discount_percentage: number;
    };
  };
  status: string;
  status_display: string;
  assignment_date: string;
  start_date: string | null;
  completion_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignmentResponse {
  items: DeliveryAssignment[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  count?: number; // Añadimos esta propiedad para compatibilidad
}