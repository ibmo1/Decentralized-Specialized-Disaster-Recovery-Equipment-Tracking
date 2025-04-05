;; Deployment Tracking Contract
;; Monitors location and status during disasters

(define-data-var last-id uint u0)

;; Deployment data structure
(define-map deployments
  { id: uint }
  {
    equipment-id: uint,
    location: (string-ascii 64),
    deployer: principal,
    disaster-id: (string-ascii 32),
    status: (string-ascii 16)
  }
)

;; Deploy equipment
(define-public (deploy
    (equipment-id uint)
    (location (string-ascii 64))
    (disaster-id (string-ascii 32)))
  (let
    ((new-id (+ (var-get last-id) u1)))

    ;; Update last ID
    (var-set last-id new-id)

    ;; Add deployment to the map
    (map-set deployments
      { id: new-id }
      {
        equipment-id: equipment-id,
        location: location,
        deployer: tx-sender,
        disaster-id: disaster-id,
        status: "active"
      }
    )

    (ok new-id)
  )
)

;; Get deployment details
(define-read-only (get-deployment (id uint))
  (map-get? deployments { id: id })
)

;; Update deployment status
(define-public (update-status (id uint) (new-status (string-ascii 16)))
  (let
    ((deployment (unwrap! (map-get? deployments { id: id }) (err u1))))

    ;; Check if caller is the deployer
    (asserts! (is-eq tx-sender (get deployer deployment)) (err u2))

    ;; Update deployment status
    (map-set deployments
      { id: id }
      (merge deployment { status: new-status })
    )

    (ok true)
  )
)

