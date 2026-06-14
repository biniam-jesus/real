/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'am';

export interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

export const DICTIONARY: Translations = {
  // Common Buttons & Labels
  'brand_name': { en: 'SHEGA BITES', am: 'ሸጋ ባይትስ' },
  'pos_hub': { en: 'POS Hub', am: 'የሽያጭ ማዕከል' },
  'system_tagline': { en: 'Real-time Dual-branch Multi-role System', am: 'የእውነተኛ ጊዜ ቅርንጫፍ እና ባለብዙ ሚና ስርዓት' },
  'branch': { en: 'Branch', am: 'ቅርንጫፍ' },
  'waiter': { en: 'Waiter', am: 'አስተናጋጅ' },
  'chef': { en: 'Chef', am: 'ሼፍ' },
  'admin': { en: 'Admin', am: 'አስተዳዳሪ' },
  're_seed': { en: 'Re-seed', am: 'እንደገና ጫን' },
  'exit': { en: 'Exit', am: 'ውጣ' },
  'or_waiter': { en: 'Waiter', am: 'አስተናጋጅ' },
  'or_chef': { en: 'Chef', am: 'ሼፍ' },
  'or_admin': { en: 'Admin', am: 'አስተዳዳሪ' },
  'cancel': { en: 'Cancel', am: 'ሰርዝ' },
  'submit': { en: 'Submit', am: 'አስገባ' },
  'search': { en: 'Search...', am: 'ፈልግ...' },
  'subtotal': { en: 'Subtotal', am: 'ንዑስ ድምር' },
  'vat': { en: 'VAT (15%)', am: 'ተ.እ.ታ (15%)' },
  'total_bill': { en: 'Total Bill', am: 'አጠቃላይ ክፍያ' },
  'total': { en: 'Total', am: 'ጠቅላላ' },
  'status': { en: 'Status', am: 'ሁኔታ' },
  'date': { en: 'Date', am: 'ቀን' },
  'time': { en: 'Time', am: 'ሰዓት' },
  'date_label': { en: 'DATE', am: 'ቀን' },
  'time_label': { en: 'TIME', am: 'ሰዓት' },
  'invoice_label': { en: 'INVOICE', am: 'ደረሰኝ' },
  'kitchen_expo_title': { en: 'Kitchen Expo & Preparation Monitor', am: 'የወጥ ቤት ዝግጅት እና ቁጥጥር ማሳያ' },
  'kitchen_expo_desc': { en: 'Track raw order items, control cooking states, adjust ticket queues', am: 'ጥሬ የምግብ እቃዎችን ይከታተሉ፣ የዝግጅት ሁኔታዎችን ይቆጣጠሩ፣ የትዕዛዝ ቅደም ተከተሎችን ያስተካክሉ' },
  'active_tickets_btn': { en: 'Active Tickets', am: 'ንቁ ትዕዛዞች' },
  'served_tickets_btn': { en: 'Served Tickets', am: 'የቀረቡ ትዕዛዞች' },
  'no_tickets_found': { en: 'No Tickets Found', am: 'ምንም ትዕዛዞች አልተገኙም' },
  'waiters_no_tickets_active': { en: 'Waiters have not submitted any pending active orders today. Add one in POS!', am: 'አስተናጋጆች ዛሬ ምንም ንቁ ትዕዛዝ አላስገቡም። በሽያጭ መስኮቱ ላይ ይጨምሩ!' },
  'no_completed_tickets_history': { en: 'No complete served table tickets recorded in history so far.', am: 'እስካሁን በታሪክ ውስጥ የተመዘገቡ ተጠናቀው የቀረቡ ጠረጴዛዎች የሉም።' },
  'ticket_label': { en: 'TICKET', am: 'ትዕዛዝ' },
  'start_cooking': { en: 'Start Cooking', am: 'ማብሰል ጀምር' },
  'ready_to_serve': { en: 'Ready to Serve', am: 'ለማቅረብ ዝግጁ' },
  'consumable_served': { en: 'Consumable Served', am: 'ሂሳቡ ተከፍሏል / ቀርቧል' },
  'deductions_finalized_at': { en: 'Deductions finalized at', am: 'ከተሞከረበት ቀን መቀነስ የተጠናቀቀበት ሰዓት' },
  'ticket_updated_toast': { en: 'Ticket Updated', am: 'ትዕዛዝ ተሻሽሏል' },
  'table_changed_to_toast': { en: 'changed to', am: 'ወደሚከተለው ተቀይሯል' },
  'just_now_badge': { en: 'Just now', am: 'አሁን' },
  'delayed_badge': { en: 'Delayed', am: 'ዘግይቷል' },
  'waiting_badge': { en: 'For', am: 'ለ' },
  'table_status_prefix': { en: 'Table Status', am: 'የጠረጴዛ ሁኔታ' },
  'manage_orders_hint': { en: 'Manage orders for this dining setup', am: 'የዚህን ጠረጴዛ ገበታ ትዕዛዞች ይቆጣጠሩ' },
  'no_active_order': { en: 'No active order', am: 'ምንም ንቁ ትዕዛዝ የለም' },
  'active_cooking_bill': { en: 'Active Cooking Bill:', am: 'በምግብ አዘገጃጀት ላይ ያለ ክፍያ፦' },
  'waiter_label': { en: 'Waiter', am: 'አስተናጋጅ' },
  'special_note_label': { en: 'Special Note', am: 'ልዩ ማስታወሻ' },
  'extras_requested': { en: 'Extras requested', am: 'ተጨማሪ ፍላጎቶች' },
  'print_invoice_btn': { en: 'Print Invoice', am: 'ደረሰኝ አትም' },
  'current_order_draft': { en: 'Current Order Draft', am: 'አሁን ያለ ረቂቅ ትዕዛዝ' },
  'clear_all_btn': { en: 'Clear All', am: 'ሁሉንም ሰርዝ' },
  'empty_draft_p1': { en: 'Your new draft is empty.', am: 'አዲስ ረቂቅ ትዕዛዝዎ ባዶ ነው።' },
  'empty_draft_p2': { en: 'Select menu options on the left to add items.', am: 'እቃዎች ለመጨመር በግራ በኩል ካለው ዝርዝር ይምረጡ።' },
  'option_prefix': { en: 'Option', am: 'አማራጭ' },
  'each_label': { en: 'each', am: 'በነጠላ' },
  'order_dispatch_metadata': { en: 'Order Dispatch Metadata & Extras', am: 'የትዕዛዝ መላኪያ መረጃ እና ተጨማሪዎች' },
  'waiter_name_label': { en: 'Waiter Name', am: 'የአስተናጋጅ ስም' },
  'waiter_name_placeholder': { en: 'Enter waiter name...', am: 'የአስተናጋጅ ስም ያስገቡ...' },
  'special_note_label_field': { en: 'Special note', am: 'ልዩ ማስታወሻ' },
  'special_note_placeholder': { en: 'E.g., No spicy, extra sauce, enjera separate...', am: 'ምሳሌ፦ ቃሪያ አይበዛበት፣ ተጨማሪ ሶስ፣ እንጀራ ለየብቻ...' },
  'extra_payable_label': { en: 'Extra Payable Services (Checkboxes)', am: 'ተጨማሪ የሚከፈልባቸው አገልግሎቶች (ምልክት ማድረጊያ)' },
  'table_active_order_warning': { en: 'Table Has Active Order', am: 'ጠረጴዛው ላይ ንቁ ትዕዛዝ አለ' },
  'send_order_kitchen_btn': { en: 'Send Order to Kitchen', am: 'ትዕዛዙን ወደ ኩሽና ላክ' },
  'active_order_table_notice': { en: '* Close or serve the active table billing before adding new order tickets.', am: '* አዲስ ትዕዛዞችን ከመጨመርዎ በፊት የቆዩትን ጠረጴዛዎች ሂሳብ መዝጋት ወይም አቅርበው መጨረስ አለብዎት።' },
  'close': { en: 'Close', am: 'ዝጋ' },

  // Login Screen
  'select_operating_branch': { en: 'Select Operating Branch', am: 'የሚሰሩበትን ቅርንጫፍ ይምረጡ' },
  'shegawan_cafe': { en: 'Shegawan Cafe', am: 'ሸጋዋን ካፌ' },
  'teyim_shega': { en: 'Teyim Shega', am: 'ጠይም ሸጋ' },
  'terminal_access_role': { en: 'Terminal Access Role', am: 'የተርሚናል መግቢያ ሚና' },
  'enter_operator_pin': { en: 'Enter Operator PIN', am: 'የመግቢያ ማስገቢያ ቁጥር' },
  'pin_placeholder': { en: '4-Digit PIN code', am: 'የ 4-አሃዝ ሚስጥር ቁጥር' },
  'submit_pin': { en: 'Submit PIN', am: 'ሚስጥር ቁጥር አስገባ' },
  'system_desc': { en: 'Dual-Branch Real-Time Kitchen & Inventory Manager', am: 'ሁለገብ የእውነተኛ ጊዜ የወጥ ቤት እና የክምችት መቆጣጠሪያ' },
  'operator_name_optional': { en: 'Screen/Waiter Name (Optional)', am: 'የኦፕሬተር/ያስተናጋጅ ስም (አማራጭ)' },
  'operator_name_label': { en: 'Enter your custom screen name...', am: 'የማያ ስምዎን ያስገቡ...' },
  'incorrect_pin': { en: 'Incorrect Access PIN. For demo, try: Waiter=3333, Chef=2222, Admin=1234', am: 'የተሳሳተ ሚስጥር ቁጥር። ለማሳያ: አስተናጋጅ=3333, ሼፍ=2222, አስተዳዳሪ=1234 ይሞክሩ' },

  // Access Restrictions
  'access_restricted': { en: 'Access Restricted', am: 'መግባት ተገድቧል' },
  'waiter_restricted_desc': { en: 'Waiters are restricted to taking orders only via POS Terminal.', am: 'አስተናጋጆች በሽያጭ ተርሚናል ብቻ ትዕዛዞችን እንዲወስዱ ተገድበዋል።' },
  'chef_restricted_desc': { en: 'Kitchen chef is restricted to the active kitchen monitor view.', am: 'የወጥ ቤት ሼፍ በኩሽና መከታተያ ማያ ገጽ ላይ ብቻ እንዲሰራ ተገድቧል።' },
  'return_pos': { en: 'Return to POS', am: 'ወደ ሽያጭ ተመለስ' },
  'return_kitchen': { en: 'Return to Kitchen', am: 'ወደ ወጥ ቤት ተመለስ' },

  // POS Tabs/Navigation
  'pos_terminal': { en: 'POS Terminal', am: 'ሽያጭ ማስገቢያ' },
  'kitchen_monitor': { en: 'Kitchen Monitor', am: 'የወጥ ቤት መቆጣጠሪያ' },
  'recipes_stock': { en: 'Recipes & Stock', am: 'አዘገጃጀት እና ክምችት' },
  'reports_audits': { en: 'Reports & Audits', am: 'ሪፖርቶች እና ኦዲት' },

  // POS Dashboard - Tables Pane
  'dining_tables_ingress': { en: 'Dining Tables & Ingress', am: 'የምግብ ጠረጴዛዎች እና መጪዎች' },
  'active_tables_filter': { en: 'Active Tables', am: 'ስራ ላይ ያሉ' },
  'empty_tables_filter': { en: 'Empty Tables', am: 'ነጻ ጠረጴዛዎች' },
  'all_tables_filter': { en: 'All Tables', am: 'ሁሉም ጠረጴዛዎች' },
  'table': { en: 'Table', am: 'ጠረጴዛ' },
  'empty_status': { en: 'Empty', am: 'ነጻ' },
  'occupied_status': { en: 'Occupied', am: 'ተይዟል' },
  'dirty_status': { en: 'Dirty', am: 'ቆሽሿል' },
  'ready_status': { en: 'Ready', am: 'ዝግጁ' },
  'capacity': { en: 'Capacity', am: 'መቀመጫ' },
  'people': { en: 'People', am: 'ሰው' },

  // POS Dashboard - Menu Items Pane
  'search_items_placeholder': { en: 'Search Menu Items...', am: 'የምግብ ዝርዝር ፈልግ...' },
  'all_categories': { en: 'All Categories', am: 'ሁሉም ምድቦች' },
  'hot_dishes': { en: 'Hot Dishes', am: 'ትኩስ ምግቦች' },
  'cold_drinks': { en: 'Cold Drinks', am: 'ቀዝቃዛ መጠጦች' },
  'desserts': { en: 'Desserts', am: 'ጣፋጭ ምግቦች' },
  'fast_food': { en: 'Fast Food', am: 'ፈጣን ምግቦች' },
  'traditional': { en: 'Traditional', am: 'ባህላዊ ምግቦች' },
  'add_item_to_table': { en: 'Add to Table', am: 'ጠረጴዛው ላይ ጨምር' },
  'stock_left': { en: 'stock left', am: 'የቀረው ክምችት' },
  'out_of_stock': { en: 'Out of Stock', am: 'አልቋል' },

  // POS Dashboard - Order Form Pane
  'selected_table': { en: 'Selected', am: 'የተመረጠ' },
  'new_order_draft': { en: 'New Order Draft', am: 'አዲስ ረቂቅ ትዕዛዝ' },
  'waitstaff_name': { en: 'Waitstaff Name', am: 'የአስተናጋጅ ስም' },
  'order_summary': { en: 'Order Summary', am: 'በትእዛዙ ውስጥ የተቀመጡ' },
  'kitchen_notes': { en: 'Kitchen Note (Optional)', am: 'የወጥ ቤት ማስታወሻ (አማራጭ)' },
  'kitchen_notes_placeholder': { en: 'Optional kitchen preparation instructions...', am: 'አማራጭ የወጥ ቤት ዝግጅት መመሪያዎች...' },
  'extra_payable_services': { en: 'Extra Payable Services', am: 'ተጨማሪ የሚከፈልባቸው አገልግሎቶች' },
  'add_takeaway_box': { en: 'Takeaway Box', am: 'ዕቃ መውሰጃ ሳጥን' },
  'add_fast_delivery': { en: 'Add Fast Service', am: 'ፈጣን አገልግሎት ጨምር' },
  'send_order_kitchen': { en: 'Send Order to Kitchen', am: 'ትዕዛዙን ወደ ኩሽና ላክ' },
  'order_draft_empty': { en: 'Order draft is currently empty. Tap items on the left menu grid to compile a ticket.', am: 'ትዕዛዙ ባዶ ነው። የግራውን የምግብ ዝርዝር በመጫን ትዕዛዝ ያጠናቅቁ።' },
  'please_select_table': { en: 'Please select an active dining table from the left floor grid to draft or settle orders.', am: 'ትዕዛዝ ማዘጋጀት ወይም መዝጋት ለመጀመር እባክዎ ከግራ በኩል ጠረጴዛ ይምረጡ።' },
  'table_active_order_title': { en: 'Table Has Active Order', am: 'ጠረጴዛው ላይ ንቁ ትዕዛዝ አለ' },
  'order_number_label': { en: 'Order Number', am: 'የትዕዛዝ ቁጥር' },
  'order_status': { en: 'Order Status', am: 'የትዕዛዝ ሁኔታ' },
  'served_by_label': { en: 'Served By', am: 'ያስተናገደው' },
  'view_bill_settle': { en: 'View Bill & Settle', am: 'ክፍያ ይመልከቱ እና ይዝጉ' },
  'view_kitchen_instructions': { en: 'Kitchen Note', am: 'የወጥ ቤት ማስታወሻ' },

  // Bill Settlement Modal
  'dining_bill_settlement': { en: 'Dining Bill Settlement', am: 'የምግብ ሂሳብ ክፍያ' },
  'customer_invoice_copy': { en: 'Customer Invoice Copy', am: 'የደንበኛ ደረሰኝ ቅጅ' },
  'delicious_treats': { en: 'Delicious Treats & Kitchen Craft', am: 'ጣፋጭ ምግቦች እና የወጥ ቤት ጥበብ' },
  'bole_road': { en: 'Bole Road, Addis Ababa', am: 'ቦሌ መንገድ፣ አዲስ አበባ' },
  'tel_contact': { en: 'Tel: +251 911 00 22 33', am: 'ስልክ፡ +251 911 00 22 33' },
  'kitchen_note_prefix': { en: 'Kitchen Note', am: 'የወጥ ቤት ማስታወሻ' },
  'served_by_prefix': { en: 'Served By', am: 'አስተናጋጅ' },
  'paid_extras': { en: 'Paid Extras', am: 'ተጨማሪ አገልግሎት ክፍያዎች' },
  'vat_subtotal': { en: 'Subtotal (85%)', am: 'ንዑስ ድምር (85%)' },
  'vat_tax': { en: 'VAT (15.0%)', am: 'ተ.እ.ታ (15.0%)' },
  'invoice_number': { en: 'INVOICE', am: 'ደረሰኝ ቁጥር' },
  'thank_you_dining': { en: 'እናመሰግናለን! Thank You for Dining with Us!', am: 'እናመሰግናለን! ስለጎበኙን እናመሰግናለን!' },
  'cash_settle_tab': { en: 'Cash Settle', am: 'ጥሬ ገንዘብ' },
  'chapa_digital_tab': { en: 'Chapa Digital', am: 'ቻፓ ዲጂታል' },
  'standard_cash_register': { en: 'Standard Cash Register Settle', am: 'የተለመደው የጥሬ ገንዘብ መዝጊያ' },
  'cash_register_desc': { en: 'Verify cash tender amounts from the patron below. Once processed, the dining table will be released, kitchen ticket marked served, and a physical receipt prints automatically.', am: 'ከደንበኛው የተቀበሉትን ጥሬ ገንዘብ መጠን ከታች ያረጋግጡ። አንዴ ክፍያው እንደተፈጸመ፣ ጠረጴዛው ክፍት ይሆናል፣ ትዕዛዙ እንደተጠናቀቀ ምልክት ይደረግበታል፣ እና ደረሰኝ ይወጣል።' },
  'total_invoice_value': { en: 'Total Invoice Value:', am: 'አጠቃላይ የደረሰኝ ዋጋ፡' },
  'cash_received_br': { en: 'Cash Received (Br)', am: 'የተቀበሉት አጠቃላይ የብር መጠን' },
  'settle_cash_change': { en: 'Settle Cash Change:', am: 'የሚመለስ ዝርዝር ብር፡' },
  'trigger_thermal_close': { en: 'Trigger Thermal & Close Bill', am: 'ደረሰኝ አትም እና ሂሳብ ዝጋ' },
  'digital_provider_gateway': { en: 'Digital Provider Gateway', am: 'የዲጂታል ክፍያ መተላለፊያ' },
  'sandbox_connected': { en: 'Chapa Sandbox Connected', am: 'ቻፓ ሳንድቦክስ ተገናኝቷል' },
  'sandbox_fallback': { en: 'API Key Fallback Simulation', am: 'በማስመሰል ሁነታ የሚሰራ' },
  'customer_phone_ref': { en: 'Customer Phone Reference', am: 'የደንበኛ ስልክ ቁጥር' },
  'push_notification_desc': { en: 'Allows direct CBE Birr or telebirr push notifications directly to user\'s phone for digital authorization.', am: 'በቀጥታ ወደ ደንበኛው ስልክ የ CBE Birr ወይም ቴሌብር የግፋ ክፍያ መልእክት ይልካል።' },
  'send_push_payment': { en: 'Request Push Payment', am: 'የክፍያ ጥያቄ ላክ' },
  'connecting_chapa': { en: 'Connecting Chapa Gateway', am: 'ከቻፓ መተላለፊያ ጋር በመገናኘት ላይ' },
  'handshake_wait_desc': { en: 'Initializing checkout payment payload utilizing secure publishable key handshake, waiting for system webhook callback...', am: 'ሚስጥራዊ የቁልፍ ሰንሰለት በመጠቀም ክፍያውን በመጀመር ላይ፣ የስርዓቱን ማረጋገጫ በመጠባበቅ ላይ...' },
  'simulated_push_code': { en: 'Simulated Push Code Request', am: 'የተመሰለው የግፋ ማረጋገጫ ኮድ' },
  'push_auth_desc': { en: 'Chapa Sandbox has initiated the direct authorization. Ask customer for the 6-digit payment validation code sent to phone', am: 'የቻፓ የሙከራ ክፍያ ተጀምሯል። እባክዎን ወደ ስልኩ የተላከውን የ 6-አሃዝ የማረጋገጫ ኮድ ደንበኛውን ይጠይቁ' },
  'digit_auth_code': { en: '6-Digit Authorization Code', am: 'የ 6-አሃዝ ማረጋገጫ ኮድ' },
  'provider_ref': { en: 'Provider Ref', am: 'የትራንዛክሽን ቁጥር' },
  'expires_in': { en: 'Expires in', am: 'ጊዜው የሚያበቃው በ' },
  'approve_settle_br': { en: 'Approve & Settle Br', am: 'አጽድቅ እና ሂሳብ ዝጋ በ' },
  'payment_approved': { en: 'Payment Approved!', am: 'ክፍያው በተሳካ ሁኔታ ጸድቋል!' },
  'digital_wallet_success': { en: 'Chapa digital wallet settlement concluded successfully. Transaction references recorded and synchronized to Supabase DB.', am: 'የቻፓ ዲጂታል ክፍያ በተሳካ ሁኔታ ተጠናቋል። የክፍያ ዝርዝሮች ተመዝግበው ከሱፓቤዝ ዳታቤዝ ጋር ተመሳስለዋል።' },
  'provider_label': { en: 'PROVIDER:', am: 'አቅራቢ፦' },
  'mobile_ref_label': { en: 'MOBILE REF:', am: 'ስልክ ቁጥር፦' },
  'tx_ref_label': { en: 'TX REF CODE:', am: 'የዝውውር ኮድ፦' },
  'amount_secured': { en: 'AMOUNT SECURED:', am: 'የተከፈለው መጠን፦' },
  'release_table_conclude': { en: 'Release Table & Conclude Order', am: 'ጠረጴዛውን ልቀቅ እና ትዕዛዙን አጠናቅ' },

  // Kitchen Dashboard
  'active_prep_queue': { en: 'Active Prep Queue', am: 'በዝግጅት ላይ ያሉ ትዕዛዞች' },
  'completed_served': { en: 'Completed & Served', am: 'የተጠናቀቁ እና የቀረቡ' },
  'pending_status': { en: 'Pending', am: 'በጥበቃ ላይ' },
  'preparing_status': { en: 'Preparing', am: 'በመዘጋጀት ላይ' },
  'ready_status_kit': { en: 'Ready', am: 'የተዘጋጀ' },
  'served_status': { en: 'Served', am: 'የቀረበ' },
  'items_prep': { en: 'Items to Prepare', am: 'የሚዘጋጁ ምግቦች' },
  'start_preparation': { en: 'Start Preparation', am: 'ዝግጅት ጀምር' },
  'mark_as_ready': { en: 'Mark as Ready', am: 'ቀረበ ለማለት አዘጋጅ' },
  'deliver_to_table': { en: 'Deliver to Table', am: 'ለጠረጴዛው አቅርብ' },
  'elapsed': { en: 'elapsed', am: 'ፈጅቷል' },
  'kitchen_empty_desc': { en: 'No active dining orders in preparation pipeline queue. Perfect status!', am: 'በወጥ ቤት ዝግጅት ሰንሰለት ውስጥ ምንም ንቁ ትዕዛዞች የሉም። አስደናቂ የስራ ሁኔታ!' },

  // Recipes & Stock Dashboard
  'live_kitchen_pantry_stock': { en: 'Live Kitchen Pantry Stock Balance', am: 'የወጥ ቤት የምግብ ክምችት ሚዛን' },
  'ingredient_name_th': { en: 'Ingredient Name', am: 'የግብአት ስም' },
  'category_th': { en: 'Category', am: 'ምድብ' },
  'level_balance_th': { en: 'Level / Balance', am: 'የክምችት መጠን' },
  'status_th': { en: 'Status', am: 'ሁኔታ' },
  'quick_restock_th': { en: 'Quick Restock', am: 'ፈጣን ክምችት መጨመሪያ' },
  'actions_th': { en: 'Actions', am: 'ድርጊቶች' },
  'healthy_level': { en: 'Healthy', am: 'በቂ' },
  'critical_level': { en: 'Critical Level', am: 'በጣም ዝቅተኛ' },
  'warning_level': { en: 'Warning', am: 'በጥንቃቄ ላይ' },
  'restock_success': { en: 'Successfully restocked', am: 'በተሳካ ሁኔታ ተሞልቷል' },
  'add_new_ingredient': { en: 'Add New Ingredient', am: 'አዲስ ግብአት ጨምር' },
  'adjust_recipe_ratios': { en: 'Adjust Recipe Ratios', am: 'የምግብ አዘገጃጀት መጠን አስተካክል' },
  'dish_recipe_title': { en: 'Dish Recipes & Formula Depletion Weight', am: 'የምግብ አዘገጃጀት እና የክብደት መቀነሻ' },
  'recipe_ingredients_title': { en: 'Recipe Ingredients Configuration', am: 'የአዘገጃጀት ግብአቶች ውቅር' },

  // Reports & Audits Dashboard
  'shega_bites_pulse': { en: 'Shega Bites Pulse Engine', am: 'የሸጋ ባይትስ የስራ መከታተያ ሞተር' },
  'financial_overview': { en: 'Financial Overview & Revenue Analytics', am: 'የፋይናንስ አጠቃላይ እይታ እና የገቢ ትንታኔ' },
  'sales_analytics': { en: 'Sales Analytics', am: 'የሽያጭ ትንታኔ' },
  'total_revenue': { en: 'Total Revenue', am: 'አጠቃላይ ገቢ' },
  'served_orders': { en: 'Served Orders', am: 'የቀረቡ ትዕዛዞች' },
  'average_ticket': { en: 'Avg Ticket Value', am: 'አማካይ የደረሰኝ ዋጋ' },
  'low_inventory_items': { en: 'Low Inventory Items', am: 'ያለቁ/የሚያልቁ ግብአቶች' },
  'system_audit_trail': { en: 'Real-time System Audit Trail Logs', am: 'የእውነተኛ ጊዜ የስርዓቱ ኦዲት ሰነዶች' },
  'pantry_restock_feed': { en: 'Pantry Auto-deduction & Restock Feed', am: 'የተቀነሱ እና የተሞሉ የምግብ ክምችት ዝርዝሮች' },
  'search_audits': { en: 'Search audit events, actors...', am: 'ኦዲቶችን፣ ተዋናዮችን ይፈልጉ...' }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const cached = localStorage.getItem('shega_pos_language');
    return (cached === 'am' || cached === 'en') ? cached : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shega_pos_language', lang);
  };

  const t = (key: string): string => {
    const term = DICTIONARY[key];
    if (!term) return key;
    return term[language] || term['en'] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
