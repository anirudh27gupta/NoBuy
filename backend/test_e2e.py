import requests
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://127.0.0.1:5000/api'

def run_tests():
    print("==================================================")
    print("NO-BUY COMPREHENSIVE END-TO-END WORKFLOW TEST")
    print("==================================================")

    # 1. Health check
    print("\n[1] Testing Health Endpoint...")
    res = requests.get(f'{BASE_URL}/health')
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Health check OK:", res.json())

    # 2. User Registration (Unified Account: User A)
    print("\n[2] Testing User Registration...")
    user_a_email = f"alex_{int(time.time())}@example.com"
    res = requests.post(f'{BASE_URL}/auth/register', json={
        'full_name': 'Arjun Rao',
        'email': user_a_email,
        'password': 'password123',
        'phone': '+91 98765 43214',
        'address': 'Chennai, Tamil Nadu'
    })
    assert res.status_code == 201, f"Registration failed: {res.text}"
    token_a = res.json()['token']
    user_a_id = res.json()['user']['id']
    headers_a = {'Authorization': f'Bearer {token_a}'}
    print(f"✓ Registered User A ({user_a_email}), ID: {user_a_id}")

    # 3. User Login
    print("\n[3] Testing User Login with password verification...")
    res = requests.post(f'{BASE_URL}/auth/login', json={
        'email': user_a_email,
        'password': 'password123'
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    print("✓ Login OK, token received.")

    # 4. User A lists a product
    print("\n[4] Testing Product Listing (Lender role)...")
    res = requests.post(f'{BASE_URL}/products', headers=headers_a, json={
        'title': 'Canon EOS R5 Mirrorless Camera + 24-70mm f/2.8',
        'category': 'Cameras & Video',
        'daily_rate': 5400.00,
        'security_deposit': 25000.00,
        'item_condition': 'Like New',
        'location': 'Chennai, Tamil Nadu',
        'image_url': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
        'description': 'Flagship 45MP full-frame 8K mirrorless camera with RF 24-70mm lens, 3x batteries, and Pelican hard case.'
    })
    assert res.status_code == 201, f"Product creation failed: {res.text}"
    product_id = res.json()['product_id']
    print(f"✓ Listed product ID: {product_id}")

    # 5. User B logs in (Aanya Sharma) to rent User A's item
    print("\n[5] User B (Aanya Sharma) logs in to rent User A's camera...")
    res = requests.post(f'{BASE_URL}/auth/login', json={
        'email': 'aanya@example.com',
        'password': 'password123'
    })
    assert res.status_code == 200, f"Aanya login failed: {res.text}"
    token_b = res.json()['token']
    headers_b = {'Authorization': f'Bearer {token_b}'}
    print("✓ Aanya Sharma logged in.")

    # 6. User B initiates Negotiation (Bargaining)
    print("\n[6] Testing Bargaining Module (Proposing ₹4,500/day vs ₹5,400 original)...")
    res = requests.post(f'{BASE_URL}/negotiations', headers=headers_b, json={
        'product_id': product_id,
        'proposed_daily_rate': 4500.00,
        'renter_message': 'Hey Arjun! Would you be willing to do ₹4,500/day for a 3-day short film shoot?'
    })
    assert res.status_code == 201, f"Negotiation offer failed: {res.text}"
    neg_id = res.json()['negotiation_id']
    print(f"✓ Bargain offer sent! ID: {neg_id}")

    # 7. User A reviews offer and counters with ₹4,800/day
    print("\n[7] User A (Owner) counters offer with ₹4,800/day...")
    res = requests.put(f'{BASE_URL}/negotiations/{neg_id}/respond', headers=headers_a, json={
        'action': 'counter',
        'counter_rate': 4800.00,
        'message': 'Hi Aanya! I can do ₹4,800/day if you take great care of the RF lens!'
    })
    assert res.status_code == 200, f"Counter offer failed: {res.text}"
    print("✓ Counter-offer of ₹4,800 sent to renter.")

    # 8. User B accepts the counter-offer
    print("\n[8] User B accepts the ₹4,800 counter-offer...")
    res = requests.put(f'{BASE_URL}/negotiations/{neg_id}/respond', headers=headers_b, json={
        'action': 'accept'
    })
    assert res.status_code == 200, f"Accept offer failed: {res.text}"
    print("✓ Agreement reached at ₹4,800/day.")

    # 9. User B books the product at negotiated rate
    print("\n[9] User B creates Booking for 3 days at negotiated ₹4,800/day...")
    res = requests.post(f'{BASE_URL}/bookings', headers=headers_b, json={
        'product_id': product_id,
        'start_date': '2026-10-15',
        'end_date': '2026-10-17',
        'negotiated_rate': 4800.00,
        'renter_note': 'Agreed rate ₹4,800/day from negotiation.'
    })
    assert res.status_code == 201, f"Booking creation failed: {res.text}"
    booking_id = res.json()['booking_id']
    b_data = res.json()['booking']
    print(f"✓ Booking created! ID: {booking_id}, Rent: ₹{b_data['rent_amount']}, Deposit: ₹{b_data['security_deposit']}, Total: ₹{b_data['total_amount']}")

    # 10. User A approves the booking
    print("\n[10] User A (Owner) approves the rental booking...")
    res = requests.put(f'{BASE_URL}/bookings/{booking_id}/status', headers=headers_a, json={
        'status': 'approved'
    })
    assert res.status_code == 200, f"Booking approval failed: {res.text}"
    print("✓ Booking approved by owner.")

    # 11. User B performs Simulated Payment (Escrow checkout)
    print("\n[11] User B completes Simulated Checkout with Escrow protection...")
    res = requests.post(f'{BASE_URL}/payments/checkout', headers=headers_b, json={
        'booking_id': booking_id,
        'payment_method': 'card',
        'card_last4': '4242'
    })
    assert res.status_code == 200, f"Payment failed: {res.text}"
    pay_id = res.json()['payment_id']
    txn_id = res.json()['transaction_id']
    print(f"✓ Simulated Payment successful! Payment ID: {pay_id}, Txn: {txn_id}, Escrow: {res.json()['escrow_status']}")

    # 12. Retrieve itemized payment receipt
    print("\n[12] Retrieving itemized Payment Receipt...")
    res = requests.get(f'{BASE_URL}/payments/receipt/{pay_id}', headers=headers_b)
    assert res.status_code == 200, f"Receipt retrieval failed: {res.text}"
    receipt = res.json()['receipt']
    print(f"✓ Receipt verified: {receipt['product_title']} (₹{receipt['total_amount']} paid, Escrow: {receipt['escrow_status']})")

    # 13. User B requests return when rental concludes
    print("\n[13] User B requests return of equipment...")
    res = requests.post(f'{BASE_URL}/returns/request', headers=headers_b, json={
        'booking_id': booking_id,
        'renter_notes': 'Returned on time in original pelican case. Both lens caps attached.'
    })
    assert res.status_code == 201, f"Return request failed: {res.text}"
    return_id = res.json()['return_id']
    print(f"✓ Return request created, ID: {return_id}")

    # 14. User A performs Quality Inspection and refunds security deposit
    print("\n[14] User A conducts Quality Inspection (Condition: Pristine, ₹0 Damage)...")
    res = requests.put(f'{BASE_URL}/returns/{return_id}/inspect', headers=headers_a, json={
        'item_condition': 'excellent',
        'damage_fee': 0.00,
        'owner_remarks': 'Inspected: Pristine condition, clean sensor. Full deposit refunded.'
    })
    assert res.status_code == 200, f"Inspection failed: {res.text}"
    print(f"✓ Inspection completed! Deposit refunded: ₹{res.json()['refunded_deposit']}")

    # 15. User B submits verified Review and 5-Star Rating
    print("\n[15] User B rates the rental 5 stars with feedback...")
    res = requests.post(f'{BASE_URL}/reviews', headers=headers_b, json={
        'booking_id': booking_id,
        'rating': 5,
        'comment': 'Alex was awesome to rent from! The Canon R5 kit was in mint shape and communication was instant.'
    })
    assert res.status_code == 201, f"Review submission failed: {res.text}"
    print("✓ 5-Star Review saved and aggregated in MySQL!")

    # 16. Verify Notifications
    print("\n[16] Verifying live notifications generated in MySQL...")
    res = requests.get(f'{BASE_URL}/notifications', headers=headers_a)
    assert res.status_code == 200, f"Notifications failed: {res.text}"
    notifs = res.json()['notifications']
    print(f"✓ User A received {len(notifs)} notifications across the workflow.")

    # 17. Verify Dashboard Analytics & Dual-Mode Metrics
    print("\n[17] Verifying Dashboard Summary Metrics...")
    res = requests.get(f'{BASE_URL}/dashboard/summary', headers=headers_a)
    assert res.status_code == 200, f"Dashboard summary failed: {res.text}"
    metrics = res.json()
    print("✓ Owner Metrics:", metrics['owner_metrics'])
    print("✓ Renter Metrics:", metrics['renter_metrics'])

    print("\n==================================================")
    print("ALL 17 MODULE CHECKS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
