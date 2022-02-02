import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, FlatList, View, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { setListData } from '../actions';

let interval;
const Main = ({
  data,
  currentPage,
  nbPages,
  setList,
}) => {
  const [time, setTime] = useState(0);
  const [showModal, setShowModal] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const pageRef = useRef(currentPage);

  const getDataFromLink = useCallback((page, callback) => {
    axios.get(`https://hn.algolia.com/api/v1/search_by_date?tags=story&page=${page}`)
    .then(res => {
      setList(res?.data);
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      if(callback){
        callback();
      }
    });
  }, []);

  useEffect(() => {
    if(!nbPages || currentPage <= nbPages) {
      getDataFromLink(currentPage + 1);
    }
  }, [time]);

  const onRefresh = () => {
    clearInterval(interval);
    setInterval(() => {
      if(!nbPages || currentPage <= nbPages) {
        setTime(pre => pre + 1);
      } else {
        clearInterval(interval);
      }
    }, 3000);
    getDataFromLink(1, () => {
      setRefreshing(false);
    });
  }

  useEffect(() => {
    clearInterval(interval);
    setInterval(() => {
      if(!nbPages || currentPage <= nbPages) {
        setTime(pre => pre + 1);
      } else {
        clearInterval(interval);
      }
    }, 3000);
    getDataFromLink(1);
  }, []);

  const openInDialog = (item) => {
    setShowModal(item);
  };

  const modalContent = useCallback(() => {
    return (
      <View style={{ padding: 10, backgroundColor: 'white', borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{showModal?.title}</Text>
        <Text style={{ }}>{moment(showModal?.created_at).format('DD-MM-YYYY HH:mm')}</Text>
        {
          showModal?.url &&
          <Text style={{ marginTop: 10 }}>{showModal?.url}</Text>
        }
        <Text style={{ marginTop: 10 }}>{showModal?.author}</Text>
      </View>
    )
  }, [showModal])

  const renderItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity onPress={() => openInDialog(item)} style={{ padding: 10, marginTop: 10, borderRadius: 10, borderWidth: 2, borderColor: '#32CE9F'}}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{item?.title}</Text>
        <Text style={{ color: 'white' }}>{moment(item?.created_at).format('DD-MM-YYYY HH:mm')}</Text>
        {
          item?.url &&
          <Text style={{ color: 'white', marginTop: 10 }}>{item?.url}</Text>
        }
        <Text style={{ color: 'white', marginTop: 10 }}>{item?.author}</Text>
      </TouchableOpacity>
    );
  }, [])

  const listData = useMemo(() => {
    let result = data;
    if(searchText && selectedSearchOption) {
      result = data.filter((item) => item[selectedSearchOption].toLowerCase().indexOf(searchText.toLowerCase()) >= 0); 
    }
    if(sortBy) {
      result.sort((left, right) => {
        if(left.created_at && right.created_at ) {
          if(sortBy === 'asc') 
            return moment(left.created_at).diff(moment(right.created_at)) > 0
          else
            return moment(left.created_at).diff(moment(right.created_at)) < 0
        }
        return;
      })
    }
    return result;
  }, [data]);

  return (
    <View style={{ flex: 1, backgroundColor: '#022643', paddingBottom : 10 }}>
      <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
        <View>
          <Picker
            style={{ flex: 1, borderRadius: 5, borderColor: 'white', height: 10, borderColor: 'white', backgroundColor: 'white' }}
            selectedValue={sortBy}
            onValueChange={(itemValue, itemIndex) =>
              setSortBy(itemValue)
            }>
            <Picker.Item label="Filter by date" value="" />
            <Picker.Item label="ASC" value="asc" />
            <Picker.Item label="DESC" value="desc" />
          </Picker>
          <Picker
            style={{ marginTop: 10, flex: 1, borderRadius: 5, borderColor: 'white', height: 10, borderColor: 'white', backgroundColor: 'white' }}
            selectedValue={selectedSearchOption}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedSearchOption(itemValue)
            }>
            <Picker.Item label="Search by" value="" />
            <Picker.Item label="Title" value="title" />
            <Picker.Item label="Author" value="author" />
          </Picker>
        </View>
        <TextInput
          placeholder="Search"
          onChangeText={text => setSearchText(text)}
          style={{
            marginTop: 120,
            padding: 10,
            borderRadius: 5,
            borderColor: 'white',
            backgroundColor: 'white'
          }}
        />
      </View>
      <View>
        {
          listData &&
          <FlatList
            data={listData}
            scrollEnabled
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            style={{ marginTop: 10, paddingHorizontal: 10, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={() => <View style={{ marginTop: 10, justifyContent: 'flex-end', alignItems: 'center' }} ><Text style={{ color: 'white' }}>No content found!</Text></View> }
          />
        }
      </View>
      <Modal
        animationIn="bounceIn"
        animationOut="bounceOut"
        isVisible={Boolean(showModal)}
        onBackdropPress={() => setShowModal(null)}
      >
        {modalContent()}
      </Modal>
    </View>
  )
};

const mapStateToProps = state => ({
  ...state
});

const mapDispatchToProps = dispatch => ({
  setList: data => dispatch(setListData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);