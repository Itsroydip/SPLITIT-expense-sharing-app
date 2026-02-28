import api from './api.service'


//create group with adding initial members
export const createGroup = async (groupData) => {
  try {
    const { name, description, memberUsernames } = groupData

    // Step 1: Create the group (creator is automatically added as first member)
    const createResponse = await api.post('/groups', {
      name,
      description
    })

    const newGroup = createResponse.data.data.group
    const groupId = newGroup.id

    // Step 2: Add initial members if provided (using Promise.all for parallel execution)
    if (memberUsernames && Array.isArray(memberUsernames) && memberUsernames.length > 0) {
      // Filter out empty usernames
      const validUsernames = memberUsernames.filter(username => username && username.trim())

      // Create array of promises for parallel execution
      const memberPromises = validUsernames.map(username => 
        api.post(`/groups/${groupId}/add-member`, {
          username: username.trim()
        })
        .then(response => ({
          username,
          success: true,
          data: response.data
        }))
        .catch(error => ({
          username,
          success: false,
          error: error.response?.data?.message || 'Failed to add member'
        }))
      )

      // Execute all member additions in parallel
      const memberResults = await Promise.all(memberPromises)

      // Separate successful and failed additions
      const successfulMembers = memberResults.filter(r => r.success)
      const failedMembers = memberResults.filter(r => !r.success)

      // Return group data with detailed member results
      return {
        success: true,
        groupId: groupId,
        group: newGroup,
        memberResults,
        stats: {
          total: validUsernames.length,
          successful: successfulMembers.length,
          failed: failedMembers.length
        },
        message: failedMembers.length > 0 
          ? `Group created. ${successfulMembers.length} members added, ${failedMembers.length} failed`
          : 'Group created successfully with all members'
      }
    }

    // If no members to add, just return the group
    return {
      success: true,
      groupId: groupId,
      group: newGroup,
      message: 'Group created successfully'
    }

  } catch (error) {
    // Handle group creation failure
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create group',
      error: error
    }
  }
}

//search users by name or email for adding to group
export const searchUsers = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return { data: { users: [] } }
  }
  
  const response = await api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`)
  return response.data
}
