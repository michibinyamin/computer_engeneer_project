// import React from 'react';
// import { View, Text, StyleSheet, Image } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import tinycolor from 'tinycolor2';

// const Recommendation = () => {
//   const route = useRoute();
//   const {
//     title,
//     content,
//     imageUrl,
//     color = '#ff6f00', // default deep orange
//   } = route.params as {
//     title: string;
//     content: string;
//     imageUrl?: string;
//     color?: string;
//   };

//   const brightColor = tinycolor(color).brighten(20).toHexString();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{title}</Text>
//       <View style={[styles.divider, { backgroundColor: color }]} />
//       <Text style={styles.content}>{content}</Text>
//       {imageUrl ? (
//         <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
//       ) : null}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 28,
//     margin: 20,
//     shadowColor: '#00000020',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 20,
//     elevation: 6,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     alignItems: 'center',
//   },
//   image: {
//     width: '100%',
//     height: 180,
//     borderRadius: 16,
//     marginBottom: 20,
//     marginTop: 20, // Add space above the image
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '900',
//     fontFamily: 'serif',
//     letterSpacing: 1,
//     //textTransform: 'uppercase',
//     textAlign: 'center',
//     marginBottom: 12,
//     color: '#003366',
//   },
//   divider: {
//     height: 4,
//     width: '100%',
//     borderRadius: 2,
//     marginVertical: 16,
//   },
//   content: {
//     fontSize: 16,
//     color: '#333',
//     lineHeight: 24,
//     textAlign: 'left',
//     paddingHorizontal: 8,
//     alignSelf: 'stretch',
//   },
// });

// export default Recommendation;