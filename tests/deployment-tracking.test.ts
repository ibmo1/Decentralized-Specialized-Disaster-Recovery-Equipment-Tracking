import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract environment
const mockContractEnv = {
  txSender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  deployments: new Map(),
  lastId: 0,
  
  // Mock contract functions
  deploy(equipmentId, location, disasterId) {
    const newId = this.lastId + 1
    
    // Create deployment record
    const deployment = {
      equipmentId,
      location,
      deployer: this.txSender,
      disasterId,
      status: "active",
    }
    
    this.deployments.set(newId, deployment)
    this.lastId = newId
    
    return { ok: newId }
  },
  
  getDeployment(id) {
    return this.deployments.get(id)
  },
  
  updateStatus(id, newStatus) {
    const deployment = this.deployments.get(id)
    if (!deployment) return { err: 1 }
    if (deployment.deployer !== this.txSender) return { err: 2 }
    
    deployment.status = newStatus
    this.deployments.set(id, deployment)
    
    return { ok: true }
  },
}

describe("Deployment Tracking Contract", () => {
  beforeEach(() => {
    // Reset the mock environment
    mockContractEnv.deployments = new Map()
    mockContractEnv.lastId = 0
    mockContractEnv.txSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  })
  
  it("should deploy equipment", () => {
    const result = mockContractEnv.deploy(1, "New York City", "HURRICANE2023")
    
    expect(result).toEqual({ ok: 1 })
    
    const deployment = mockContractEnv.getDeployment(1)
    expect(deployment).toBeDefined()
    expect(deployment.equipmentId).toBe(1)
    expect(deployment.location).toBe("New York City")
    expect(deployment.disasterId).toBe("HURRICANE2023")
    expect(deployment.status).toBe("active")
  })
  
  it("should update deployment status", () => {
    mockContractEnv.deploy(1, "New York City", "HURRICANE2023")
    
    const result = mockContractEnv.updateStatus(1, "completed")
    expect(result).toEqual({ ok: true })
    
    const deployment = mockContractEnv.getDeployment(1)
    expect(deployment.status).toBe("completed")
  })
  
  it("should not allow unauthorized status updates", () => {
    mockContractEnv.deploy(1, "New York City", "HURRICANE2023")
    
    // Change sender
    mockContractEnv.txSender = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    
    const result = mockContractEnv.updateStatus(1, "completed")
    expect(result).toEqual({ err: 2 })
    
    const deployment = mockContractEnv.getDeployment(1)
    expect(deployment.status).toBe("active") // Unchanged
  })
})

