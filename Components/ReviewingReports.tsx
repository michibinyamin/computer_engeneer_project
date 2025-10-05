import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { 
  Report, 
  fetchAllReports, 
  updateReportStatus, 
  fetchGroupNameById, 
  fetchRecommendationTitleById,
  fetchCommentContentById,
  fetchRecommendationById 
} from '../Services'
import { auth } from '../firebase'
import { useNavigation } from '@react-navigation/native'

const ReviewingReports = () => {
  const navigation = useNavigation()
  const [reports, setReports] = useState<(Report & { groupName?: string; recommendationTitle?: string; commentContent?: string })[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<'reviewed' | 'resolved' | null>(null)
  const [adminComment, setAdminComment] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  // In the loadReports function, update the comment content handling:
const loadReports = async () => {
  try {
    const allReports = await fetchAllReports()
    
    // Fetch additional details for each report
    const reportsWithDetails = await Promise.all(
      allReports.map(async (report) => {
        let groupName = ''
        let recommendationTitle = ''
        let commentContent = ''

        if (report.groupId) {
          groupName = await fetchGroupNameById(report.groupId)
        }

        if (report.recommendationId) {
          recommendationTitle = await fetchRecommendationTitleById(report.recommendationId)
        }

        // ALWAYS use the preserved content from the report first
        if (report.reportedItemType === 'comment') {
          if (report.reportedContent) {
            commentContent = report.reportedContent
          } else {
            // For old reports without preserved content, try to fetch
            try {
              commentContent = await fetchCommentContentById(report.reportedItemId)
            } catch (error) {
              console.error('Error fetching comment content:', error)
              commentContent = 'Comment not found or deleted'
            }
          }
        }

        return { 
          ...report, 
          groupName, 
          recommendationTitle,
          commentContent: report.reportedItemType === 'comment' ? commentContent : undefined
        }
      })
    )

    setReports(reportsWithDetails)
  } catch (error) {
    console.error('Error loading reports:', error)
    Alert.alert('Error', 'Failed to load reports')
  }
}

  const onRefresh = async () => {
    setRefreshing(true)
    await loadReports()
    setRefreshing(false)
  }

  const handleActionClick = (reportId: string, action: 'reviewed' | 'resolved') => {
    setSelectedReport(reportId)
    setSelectedAction(action)
    setAdminComment('')
    setShowActionModal(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedReport || !selectedAction) return

    const user = auth.currentUser
    if (!user) return

    try {
      // First update the report status
      const success = await updateReportStatus(selectedReport, selectedAction, user.uid)
      
      if (success) {
        // If admin added a comment, update the report with the comment
        if (adminComment.trim()) {
          // You'll need to add this function to your Services.tsx
          await updateReportAdminComment(selectedReport, adminComment.trim(), user.uid)
        }
        
        await loadReports()
        setShowActionModal(false)
        setSelectedReport(null)
        setSelectedAction(null)
        setAdminComment('')
        
        Alert.alert('Success', `Report marked as ${selectedAction}${adminComment.trim() ? ' with comment' : ''}`)
      } else {
        Alert.alert('Error', 'Failed to update report status')
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the report')
    }
  }

  const handleViewUserProfile = (userId: string, userName: string) => {
    navigation.navigate('AdminUsersScreen', { 
      userId, 
      userName 
    })
  }

  const handleViewRecommendation = async (recommendationId: string, recommendationTitle: string) => {
    if (!recommendationId) return
    
    try {
      const recommendation = await fetchRecommendationById(recommendationId)
      
      if (recommendation) {
        navigation.navigate('EditableRecommendation', {
          recommendationId,
          title: recommendation.title || recommendationTitle || 'Recommendation',
          content: recommendation.content || '',
          imageUrl: recommendation.imageUrl || '',
          location: recommendation.location || '',
          color: recommendation.color || '#ff6f00',
          viewMode: 'view',
          createdBy: recommendation.created_by,
        })
      } else {
        Alert.alert('Error', 'Could not load recommendation details')
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error)
      Alert.alert('Error', 'Failed to load recommendation')
      navigation.navigate('EditableRecommendation', {
        recommendationId,
        title: recommendationTitle || 'Recommendation',
        content: '',
        viewMode: 'view',
      })
    }
  }

  const filteredReports = reports.filter((report) => {
    if (selectedTab === 'all') return true
    return report.status === selectedTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff6f00'
      case 'reviewed':
        return '#2196f3'
      case 'resolved':
        return '#4caf50'
      default:
        return '#666'
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return 'Invalid Date'
    }
  }

  const getActionTitle = () => {
    if (selectedAction === 'reviewed') return 'Mark as Reviewed'
    if (selectedAction === 'resolved') return 'Resolve Report'
    return 'Update Report'
  }

  const getActionDescription = () => {
    if (selectedAction === 'reviewed') {
      return 'Add a note about your review (optional):'
    }
    if (selectedAction === 'resolved') {
      return 'Describe the action taken to resolve this report (optional):'
    }
    return 'Add a comment (optional):'
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Management</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabSelected]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextSelected,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' &&
                ` (${reports.filter((r) => r.status === tab).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.reportsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No reports found</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportMeta}>
                  <Text style={styles.reportType}>
                    {report.reportedItemType.toUpperCase()} REPORT
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(report.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                </View>
                <Text style={styles.reportDate}>
                  {formatDate(report.createdAt)}
                </Text>
              </View>

              <View style={styles.reportDetails}>
                <View style={styles.userRow}>
                  <Text style={styles.detailLabel}>Reporter:</Text>
                  <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => handleViewUserProfile(report.reporterId, report.reporterName)}
                  >
                    <Text style={styles.profileButtonText}>
                      {report.reporterName} (View Profile)
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailLabelSmall}>User ID: {report.reporterId}</Text>

                <View style={styles.userRow}>
                  <Text style={styles.detailLabel}>Reported User:</Text>
                  <TouchableOpacity 
                    style={styles.profileButton}
                    onPress={() => handleViewUserProfile(report.reportedUserId, report.reportedUserName)}
                  >
                    <Text style={styles.profileButtonText}>
                      {report.reportedUserName} (View Profile)
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailLabelSmall}>User ID: {report.reportedUserId}</Text>

                <Text style={styles.detailLabel}>Reason:</Text>
                <Text style={styles.detailValue}>{report.reason}</Text>

                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{report.description}</Text>

                {/* Reported Comment Content - Displayed in Red */}
                {report.reportedItemType === 'comment' && report.commentContent && (
                  <>
                    <Text style={styles.detailLabel}>Reported Comment Content:</Text>
                    <View style={styles.commentContainer}>
                      <Text style={styles.commentText}>
                        {report.commentContent}
                        {report.commentContent === 'Comment not found or deleted' && (
                          <Text style={styles.deletedNote}> (Comment was deleted but content preserved in report)</Text>
                        )}
                      </Text>
                    </View>
                  </>
                )}

                {report.groupId && (
                  <>
                    <Text style={styles.detailLabel}>Group:</Text>
                    <Text style={styles.detailValue}>
                      {report.groupName || 'Loading...'} (ID: {report.groupId})
                    </Text>
                  </>
                )}

                {report.recommendationId && (
                  <>
                    <Text style={styles.detailLabel}>Recommendation:</Text>
                    <View style={styles.userRow}>
                      <Text style={styles.detailValue}>
                        {report.recommendationTitle || 'Loading...'} (ID: {report.recommendationId})
                      </Text>
                      <TouchableOpacity 
                        style={styles.recommendationButton}
                        onPress={() => handleViewRecommendation(report.recommendationId!, report.recommendationTitle!)}
                      >
                        <Text style={styles.recommendationButtonText}>View Full Details</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <Text style={styles.detailLabel}>Item ID:</Text>
                <Text style={styles.detailValue}>{report.reportedItemId}</Text>

                {/* Admin Comment Display */}
                {report.adminComment && (
                  <>
                    <Text style={styles.detailLabel}>Admin Comment:</Text>
                    <View style={styles.adminCommentContainer}>
                      <Text style={styles.adminCommentText}>{report.adminComment}</Text>
                    </View>
                  </>
                )}
              </View>

              {report.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.reviewButton]}
                    onPress={() => handleActionClick(report.id!, 'reviewed')}
                  >
                    <Text style={styles.actionButtonText}>Mark Reviewed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resolveButton]}
                    onPress={() => handleActionClick(report.id!, 'resolved')}
                  >
                    <Text style={styles.actionButtonText}>Resolve</Text>
                  </TouchableOpacity>
                </View>
              )}

              {report.reviewedAt && (
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewText}>
                    {report.status === 'resolved' ? 'Resolved' : 'Reviewed'} on{' '}
                    {formatDate(report.reviewedAt)}
                    {report.reviewedBy && ` by Admin`}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Admin Action Modal */}
      <Modal transparent visible={showActionModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{getActionTitle()}</Text>
            
            <Text style={styles.modalDescription}>
              {getActionDescription()}
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Enter your comments here..."
              value={adminComment}
              onChangeText={setAdminComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateStatus}
              >
                <Text style={styles.modalButtonText}>
                  {selectedAction === 'reviewed' ? 'Mark Reviewed' : 'Resolve'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowActionModal(false)
                  setSelectedReport(null)
                  setSelectedAction(null)
                  setAdminComment('')
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// Add this function to your Services.tsx file:
const updateReportAdminComment = async (reportId: string, comment: string, adminId: string): Promise<boolean> => {
  try {
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('../firebase')
    
    const reportRef = doc(db, 'reports', reportId)
    await updateDoc(reportRef, {
      adminComment: comment,
      adminCommentAt: serverTimestamp(),
      adminCommentBy: adminId,
    })
    return true
  } catch (error) {
    console.error('Error updating admin comment:', error)
    return false
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  tabsContainer: {
    marginBottom: 16,
    maxHeight: 50

  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  tabSelected: {
    backgroundColor: '#ff6f00',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  tabTextSelected: {
    color: 'white',
  },
  reportsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportMeta: {
    flex: 1,
  },
  reportType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 4,
  },
  detailLabelSmall: {
    fontSize: 10,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  profileButton: {
    backgroundColor: '#ff6f00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  recommendationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Comment content styles
  commentContainer: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#e53e3e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    marginTop: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#e53e3e',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  deletedNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  // Admin comment styles
  adminCommentContainer: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    marginTop: 4,
  },
  adminCommentText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  reviewButton: {
    backgroundColor: '#2196f3',
  },
  resolveButton: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default ReviewingReports