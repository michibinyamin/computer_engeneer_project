import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { REPORT_REASONS, submitReport } from '../Services'

interface ReportModalProps {
  visible: boolean
  onClose: () => void
  reportedItemType: 'comment' | 'recommendation'
  reportedItemId: string
  reportedUserId: string
  reportedUserName: string
  groupId?: string
  recommendationId?: string
  commentText?: string
}

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  reportedItemType,
  reportedItemId,
  reportedUserId,
  reportedUserName,
  groupId,
  recommendationId,
  commentText,
}) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In the handleSubmit function, update the submitReport call:
  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting')
      return
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await submitReport(
        reportedItemType,
        reportedItemId,
        reportedUserId,
        reportedUserName,
        selectedReason,
        description.trim(),
        groupId,
        recommendationId,
        commentText // ADD THIS: Pass the comment content to be preserved
      )

      if (success) {
        Alert.alert(
          'Success',
          'Report submitted successfully. Our team will review it soon.'
        )
        resetForm()
        onClose()
      } else {
        Alert.alert('Error', 'Failed to submit report. Please try again.')
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while submitting the report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedReason('')
    setDescription('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Content</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content}>
            <Text style={styles.subtitle}>
              Reporting {reportedItemType} by {reportedUserName}
            </Text>

            {commentText && (
              <View style={styles.commentPreview}>
                <Text style={styles.commentLabel}>Comment:</Text>
                <Text style={styles.commentText}>"{commentText}"</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Select Reason *</Text>
            <View style={styles.reasonsContainer}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.reasonButtonSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Additional Details *</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Please describe what happened in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.note}>
              Your report will be reviewed by our admin team. We take all
              reports seriously.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  commentPreview: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  reasonsContainer: {
    marginBottom: 16,
  },
  reasonButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonButtonSelected: {
    borderColor: '#ff6f00',
    backgroundColor: '#fff3e0',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
  },
  reasonTextSelected: {
    color: '#ff6f00',
    fontWeight: '500',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  note: {
    padding: 15,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#ff6f00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default ReportModal
