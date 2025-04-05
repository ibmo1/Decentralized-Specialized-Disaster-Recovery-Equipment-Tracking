;; Return Processing Contract
;; Manages recovery of deployed resources

(define-data-var last-id uint u0)

;; Return record data structure
(define-map return-records
  { id: uint }
  {
    deployment-id: uint,
    equipment-id: uint,
    returner: principal,
    condition: (string-ascii 32),
    location: (string-ascii 64),
    status: (string-ascii 16)
  }
)

;; Process equipment return
(define-public (process
    (deployment-id uint)
    (equipment-id uint)
    (condition (string-ascii 32))
    (location (string-ascii 64)))
  (let
    ((new-id (+ (var-get last-id) u1)))

    ;; Update last ID
    (var-set last-id new-id)

    ;; Add return record to the map
    (map-set return-records
      { id: new-id }
      {
        deployment-id: deployment-id,
        equipment-id: equipment-id,
        returner: tx-sender,
        condition: condition,
        location: location,
        status: "processed"
      }
    )

    (ok new-id)
  )
)

;; Get return record
(define-read-only (get-record (id uint))
  (map-get? return-records { id: id })
)

;; Update return status
(define-public (update-status (id uint) (new-status (string-ascii 16)))
  (let
    ((record (unwrap! (map-get? return-records { id: id }) (err u1))))

    ;; Check if caller is the returner
    (asserts! (is-eq tx-sender (get returner record)) (err u2))

    ;; Update return status
    (map-set return-records
      { id: id }
      (merge record { status: new-status })
    )

    (ok true)
  )
)

