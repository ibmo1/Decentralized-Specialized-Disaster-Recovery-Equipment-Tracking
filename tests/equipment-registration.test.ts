import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract environment
const mockContractEnv = {
  txSender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  equipments: new Map(),
  lastId: 0,
  
  // Mock contract functions
  register(name, type, serial) {
    const newId = this.lastId + 1
    
    // Create equipment record
    const equipment = {
      name,
      type,
      serial,
      owner: this.txSender,
      status: "available",
    }
    
    this.equipments.set(newId, equipment)
    this.lastId = newId
    
    return { ok: newId }
  },
  
  getEquipment(id) {
    return this.equipments.get(id)
  },
  
  updateStatus(id, newStatus) {
    const equipment = this.equipments.get(id)
    if (!equipment) return { err: 1 }
    if (equipment.owner !== this.txSender) return { err: 2 }
    
    equipment.status = newStatus
    this.equipments.set(id, equipment)
    
    return { ok: true }
  },
}

describe("Equipment Registration Contract", () => {
  beforeEach(() => {
    // Reset the mock environment
    mockContractEnv.equipments = new Map()
    mockContractEnv.lastId = 0
    mockContractEnv.txSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  })
  
  it("should register new equipment", () => {
    const result = mockContractEnv.register("Generator", "Power", "GEN123456")
    
    expect(result).toEqual({ ok: 1 })
    expect(mockContractEnv.lastId).toBe(1)
    
    const equipment = mockContractEnv.getEquipment(1)
    expect(equipment).toBeDefined()
    expect(equipment.name).toBe("Generator")
    expect(equipment.type).toBe("Power")
    expect(equipment.serial).toBe("GEN123456")
    expect(equipment.status).toBe("available")
  })
  
  it("should update equipment status", () => {
    mockContractEnv.register("Generator", "Power", "GEN123456")
    
    const result = mockContractEnv.updateStatus(1, "in-use")
    expect(result).toEqual({ ok: true })
    
    const equipment = mockContractEnv.getEquipment(1)
    expect(equipment.status).toBe("in-use")
  })
  
  it("should not allow unauthorized status updates", () => {
    mockContractEnv.register("Generator", "Power", "GEN123456")
    
    // Change sender
    mockContractEnv.txSender = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    
    const result = mockContractEnv.updateStatus(1, "in-use")
    expect(result).toEqual({ err: 2 })
    
    const equipment = mockContractEnv.getEquipment(1)
    expect(equipment.status).toBe("available") // Unchanged
  })
})

