import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { Portal, Modal, Text, TextInput, Button } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';

interface ContestInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    contest: {
      _id: string | null;
      name: string;
      description: string;
      start_time: string;
      end_time: string;
      duration: number;
    },
    isEditing: boolean
  ) => void;
  contestToEdit?: {
    _id: string | null;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    duration: number;
  } | null;
}

const ContestInfoModal: React.FC<ContestInfoModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  contestToEdit,
}) => {
  const [contest, setContest] = useState({
    _id: "",
    name: "",
    description: "",
    start_time: new Date(),
    end_time: new Date(),
    duration: "",
  });

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  useEffect(() => {
    if (contestToEdit) {
      setContest({
        _id: contestToEdit?._id ? contestToEdit?._id : "",
        name: contestToEdit.name,
        description: contestToEdit.description,
        start_time: new Date(contestToEdit.start_time),
        end_time: new Date(contestToEdit.end_time),
        duration: contestToEdit.duration.toString(),
      });
    } else {
      setContest({
        _id: "",
        name: "",
        description: "",
        start_time: new Date(),
        end_time: new Date(),
        duration: "",
      });
    }
  }, [contestToEdit]);

  const handleSave = () => {
    if (!contest.name || !contest.duration) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (contest.end_time <= contest.start_time) {
      alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
      return;
    }

    const formattedContest = {
      ...contest,
      duration: parseInt(contest.duration, 10),
      start_time: contest.start_time.toISOString(),
      end_time: contest.end_time.toISOString(),
    };

    onSubmit(formattedContest, !!contestToEdit);
    onDismiss();
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDatePickerVisible(false);
    setContest({ ...contest, start_time: date });
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDatePickerVisible(false);
    setContest({ ...contest, end_time: date });
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>
              {contestToEdit ? "Sửa Cuộc Thi" : "Thêm Cuộc Thi"}
            </Text>

            <TextInput
              label="Tên Cuộc Thi"
              value={contest.name}
              onChangeText={(text) => setContest({ ...contest, name: text })}
              style={styles.input}
              mode="outlined"
              returnKeyType="next"
            />
            <TextInput
              label="Mô Tả"
              value={contest.description}
              onChangeText={(text) => setContest({ ...contest, description: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              returnKeyType="next"
            />

            <Text style={styles.label}>Thời Gian Bắt Đầu</Text>
            <Button
              mode="outlined"
              onPress={() => setStartDatePickerVisible(true)}
              style={styles.datePickerButton}
              icon="calendar"
            >
              {format(contest.start_time, 'dd/MM/yyyy HH:mm')}
            </Button>

            <Text style={styles.label}>Thời Gian Kết Thúc</Text>
            <Button
              mode="outlined"
              onPress={() => setEndDatePickerVisible(true)}
              style={styles.datePickerButton}
              icon="calendar"
            >
              {format(contest.end_time, 'dd/MM/yyyy HH:mm')}
            </Button>

            <TextInput
              label="Thời Lượng (phút)"
              value={contest.duration}
              onChangeText={(text) => setContest({ ...contest, duration: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Nhập thời lượng (phút)"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={handleDismiss} style={styles.cancelButton}>
                Hủy
              </Button>
              <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                Lưu
              </Button>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="datetime"
          onConfirm={handleStartDateConfirm}
          onCancel={() => setStartDatePickerVisible(false)}
          minimumDate={new Date()}
          date={contest.start_time}
          locale="vi"
        />

        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="datetime"
          onConfirm={handleEndDateConfirm}
          onCancel={() => setEndDatePickerVisible(false)}
          minimumDate={contest.start_time}
          date={contest.end_time}
          locale="vi"
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 30,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  datePickerButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
    borderColor: "#6A0DAD",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#6A0DAD",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6A0DAD",
  },
});

export default ContestInfoModal;
