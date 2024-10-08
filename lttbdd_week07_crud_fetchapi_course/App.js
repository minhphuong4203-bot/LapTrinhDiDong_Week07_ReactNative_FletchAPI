import * as React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  SafeAreaView,
  Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// const Item = ({ title }) => (
//   <View style={styles.item}>
//     <Text style={styles.titleItem}>{title}</Text>
//     <TouchableOpacity>
//       <Icon name="pencil" size={20} color="red" />
//     </TouchableOpacity>
//   </View>
// );

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [name, setName] = React.useState('');

  const handleGetStarted = () => {
    navigation.navigate('List', { userName: name });
  };

  return (
    <View style={styles.homeContainer}>
      <Text style={styles.homeTitle}>MANAGE YOUR</Text>
      <Text style={styles.homeTitle}>TASK</Text>
      <View style={styles.homeInputContainer}>
        <Icon name="envelope" size={20} color="#8A2BE2" style={styles.icon} />
        <TextInput
          style={styles.homeInput}
          placeholder="Enter your name"
          placeholderTextColor="#9095A0"
          value={name}
          onChangeText={setName}
        />
      </View>
      <TouchableOpacity style={styles.homeButton} onPress={handleGetStarted}>
        <Text style={styles.homeButtonText}>GET STARTED ➔</Text>
      </TouchableOpacity>
    </View>
  );
};

const ListScreen = ({ navigation, route }) => {
  const userName = route.params?.userName || 'Guest';
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://66fe07bc699369308956d365.mockapi.io/course');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa mục
  const handleDelete = async (id) => {
    try {
      await fetch(`https://66fe07bc699369308956d365.mockapi.io/course/${id}`, {
        method: 'DELETE',
      });
      refreshData(); // Tải lại dữ liệu sau khi xóa
    } catch (error) {
      setError(error.message);
    }
  };

  // Hàm chuyển đến trang Add với dữ liệu để sửa
  const handleEdit = (item) => {
    navigation.navigate('Add', { userName, item, refreshData }); // Truyền refreshData vào params
  };

  React.useEffect(() => {
    refreshData(); // Tải dữ liệu khi vào trang
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.listContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <View style={styles.userInfoContainer}>
          <Icon name="user" size={24} color="#000" style={styles.logo} />
          <View>
            <Text style={styles.headerText}>Hi {userName}</Text>
            <Text style={styles.subHeaderText}>Have a great day ahead</Text>
          </View>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#A9A9A9" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="#A9A9A9" />
      </View>
      <SafeAreaView style={styles.containerItem}>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <Item
              title={item.title}
              onEdit={() => handleEdit(item)} // Chuyển đến trang sửa
              onDelete={() => handleDelete(item.id)} // Xóa mục
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </SafeAreaView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Add', { userName, refreshData })}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const Item = ({ title, onEdit, onDelete }) => (
  <View style={styles.item}>
    <Text style={styles.titleItem}>{title}</Text>
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={onEdit}>
        <Icon name="pencil" size={20} color="red" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={{ marginLeft: 10 }}>
        <Icon name="times" size={20} color="red" />
      </TouchableOpacity>
    </View>
  </View>
);

const AddScreen = ({ navigation, route }) => {
  const userName = route.params?.userName || 'Guest';
  const item = route.params?.item; // Nhận dữ liệu từ ListScreen
  const refreshData = route.params?.refreshData; // Nhận refreshData từ params
  const [jobTitle, setJobTitle] = React.useState(item ? item.title : '');

  const handleFinish = async () => {
    if (item) {
      // Cập nhật mục
      try {
        await fetch(`https://66fe07bc699369308956d365.mockapi.io/course/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: jobTitle }),
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      // Thêm mục mới
      try {
        await fetch('https://66fe07bc699369308956d365.mockapi.io/course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: jobTitle }),
        });
      } catch (error) {
        console.error(error);
      }
    }
    refreshData(); // Tải lại dữ liệu sau khi thêm/sửa
    navigation.navigate('List', { userName }); // Quay lại trang List
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Icon name="user" size={24} color="#000" style={styles.logo} />
          <View>
            <Text style={styles.userName}>Hi {userName}</Text>
            <Text style={styles.userGreeting}>Have a great day ahead</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>ADD YOUR JOB</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputField}
          placeholder="Input your job"
          placeholderTextColor="#9095A0"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
      </View>
      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>FINISH ➔</Text>
      </TouchableOpacity>
      <View style={styles.imageWrapper}>
        <Image
          source={require('./assets/images/bookAndPencil.png')}
          style={styles.image}
        />
      </View>
    </View>
  );
};

// Thay đổi trong App
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="List"
          component={ListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Add"
          component={AddScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 20,
  },
  homeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderColor: '#9095A0',
  },
  icon: {
    marginRight: 10,
    color: 'black',
    fontSize: 16,
  },
  homeInput: {
    height: 43,
    flex: 1,
  },
  homeButton: {
    backgroundColor: '#00BFFF',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginBottom: 20,
  // },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // Màu chữ đen
    marginLeft: 10,
  },
  logo: {
    marginRight: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#000', // Màu chữ đen
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#9095A0',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
    color: '#000',
  },
  containerItem: {
    flex: 1,
    marginTop: 80,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#E0E0E0',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  titleItem: {
    fontSize: 18,
    color: '#333',
  },
  addButton: {
    left: '50%',
    marginLeft: -30, // half of button width
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00BFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000', // Màu chữ đen
    marginVertical: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  userGreeting: {
    fontSize: 16,
    color: '#000',
  },
  // title: {
  //   fontSize: 30,
  //   fontWeight: 'bold',
  //   color: '#000',
  //   marginVertical: 20,
  //   textAlign: 'center',
  // },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#9095A0',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputField: {
    height: 40,
  },
  finishButton: {
    marginTop: 70,
    backgroundColor: '#00BFFF',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 40,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  imageWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 100,
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default App;
