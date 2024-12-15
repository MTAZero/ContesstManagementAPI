import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Appbar, TextInput, Button } from "react-native-paper";
import contestService from "../../../services/contestService";
import questionService from "../../../services/questionService";
import categoryService from "../../../services/categoryService";

const AddQuestionScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const { contestId, accessToken, onQuestionAdded } = route.params;

  // State cho câu hỏi
  const [searchKeyword, setSearchKeyword] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [questionPage, setQuestionPage] = useState(1);
  const [questionTotalPages, setQuestionTotalPages] = useState(1);

  // State cho danh mục
  const [categoryKeyword, setCategoryKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);

  const [selectedOption, setSelectedOption] = useState<"manual" | "category">(
    "category"
  );
  const [loading, setLoading] = useState(false);

  const pageSize = 5; // Số lượng mỗi trang

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await questionService.getQuestions(
        "",
        pageSize,
        questionPage,
        searchKeyword,
        accessToken
      );
      const { items, total } = response.data;
      setAvailableQuestions(items || []);
      setQuestionTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories(
        pageSize,
        categoryPage,
        categoryKeyword,
        accessToken
      );
      const { items, total } = response.data;
      setCategories(items || []);
      setCategoryTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      await contestService.addQuestionsToContest(
        contestId,
        [questionId],
        accessToken
      );
      onQuestionAdded();
      navigation.goBack();
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      await contestService.addCategoryQuestionsToContest(
        contestId,
        categoryId,
        accessToken
      );
      onQuestionAdded();
      navigation.goBack();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOption === "manual") fetchQuestions();
    if (selectedOption === "category") fetchCategories();
  }, [selectedOption, questionPage, categoryPage]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thêm Câu Hỏi" />
      </Appbar.Header>

      <View style={styles.options}>
        <TouchableOpacity
          onPress={() => {
            setSelectedOption("category");
            setCategoryPage(1);
          }}
          style={[
            styles.optionButton,
            selectedOption === "category" && styles.selectedOption,
          ]}
        >
          <Text style={selectedOption === "category" && styles.selectedText}>
            Thêm Cả Danh Mục
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedOption("manual");
            setQuestionPage(1);
          }}
          style={[
            styles.optionButton,
            selectedOption === "manual" && styles.selectedOption,
          ]}
        >
          <Text style={selectedOption === "manual" && styles.selectedText}>
            Chọn Câu Hỏi
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6A0DAD"
          style={styles.loading}
        />
      ) : selectedOption === "manual" ? (
        <View style={styles.content}>
          <TextInput
            placeholder="Tìm kiếm câu hỏi..."
            value={searchKeyword}
            onChangeText={(text) => {
              setSearchKeyword(text);
              setQuestionPage(1);
            }}
            onSubmitEditing={fetchQuestions}
            style={styles.searchInput}
          />
          <FlatList
            data={availableQuestions}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.questionText}>
                  {pageSize * (questionPage - 1) + index + 1}. {item.content}
                </Text>
                <Button
                  onPress={() => handleAddQuestion(item._id)}
                  mode="contained"
                  style={styles.addButton}
                >
                  Thêm
                </Button>
              </View>
            )}
          />
          <View style={styles.pagination}>
            <Button
              mode="outlined"
              disabled={questionPage === 1}
              onPress={() => setQuestionPage((prev) => prev - 1)}
              style={styles.paginationButton}
            >
              Trang trước
            </Button>
            <Text style={styles.paginationText}>
              Trang {questionPage} / {questionTotalPages}
            </Text>
            <Button
              mode="outlined"
              disabled={questionPage === questionTotalPages}
              onPress={() => setQuestionPage((prev) => prev + 1)}
              style={styles.paginationButton}
            >
              Trang sau
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <TextInput
            placeholder="Tìm kiếm danh mục..."
            value={categoryKeyword}
            onChangeText={(text) => {
              setCategoryKeyword(text);
              setCategoryPage(1);
            }}
            onSubmitEditing={fetchCategories}
            style={styles.searchInput}
          />
          <FlatList
            data={categories}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text>{item.name}</Text>
                <Button
                  onPress={() => handleAddCategory(item._id)}
                  mode="contained"
                  style={styles.addButton}
                >
                  Thêm
                </Button>
              </View>
            )}
          />
          <View style={styles.pagination}>
            <Button
              mode="outlined"
              disabled={categoryPage === 1}
              onPress={() => setCategoryPage((prev) => prev - 1)}
              style={styles.paginationButton}
            >
              Trang trước
            </Button>
            <Text style={styles.paginationText}>
              Trang {categoryPage} / {categoryTotalPages}
            </Text>
            <Button
              mode="outlined"
              disabled={categoryPage === categoryTotalPages}
              onPress={() => setCategoryPage((prev) => prev + 1)}
              style={styles.paginationButton}
            >
              Trang sau
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#6A0DAD",
    borderColor: "#6A0DAD",
  },
  selectedText: {
    color: "#fff",
  },
  searchInput: {
    margin: 10,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    margin: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  questionText: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#6A0DAD",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
  },
  paginationButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  paginationText: {
    textAlign: "center",
    fontSize: 16,
  },
  loading: {
    marginTop: 20,
  },
});

export default AddQuestionScreen;
