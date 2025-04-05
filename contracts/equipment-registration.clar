;; Equipment Registration Contract
;; Records details of emergency response gear

(define-data-var last-id uint u0)

;; Equipment data structure
(define-map equipments
  { id: uint }
  {
    name: (string-ascii 64),
    type: (string-ascii 32),
    serial: (string-ascii 64),
    owner: principal,
    status: (string-ascii 16)
  }
)

;; Register new equipment
(define-public (register
    (name (string-ascii 64))
    (type (string-ascii 32))
    (serial (string-ascii 64)))
  (let
    ((new-id (+ (var-get last-id) u1)))

    ;; Update last ID
    (var-set last-id new-id)

    ;; Add equipment to the map
    (map-set equipments
      { id: new-id }
      {
        name: name,
        type: type,
        serial: serial,
        owner: tx-sender,
        status: "available"
      }
    )

    (ok new-id)
  )
)

;; Get equipment details
(define-read-only (get-equipment (id uint))
  (map-get? equipments { id: id })
)

;; Update equipment status
(define-public (update-status (id uint) (new-status (string-ascii 16)))
  (let
    ((equipment (unwrap! (map-get? equipments { id: id }) (err u1))))

    ;; Check if caller is the owner
    (asserts! (is-eq tx-sender (get owner equipment)) (err u2))

    ;; Update equipment status
    (map-set equipments
      { id: id }
      (merge equipment { status: new-status })
    )

    (ok true)
  )
)

