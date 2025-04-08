import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:share_plus/share_plus.dart';
import '../services/text_processing_service.dart';
import '../widgets/text_input_widget.dart';
import '../widgets/text_output_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _textController = TextEditingController();
  
  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final textService = Provider.of<TextProcessingService>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Organizér Textu'),
        actions: [
          if (textService.processedText != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () {
                Share.share(textService.processedText!);
              },
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: textService.isLoading 
                ? const Center(
                    child: SpinKitWave(
                      color: Color(0xFF4285F4),
                      size: 50.0,
                    ),
                  )
                : textService.processedText == null
                    ? TextInputWidget(controller: _textController)
                    : TextOutputWidget(),
            ),
            if (textService.error != null)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  textService.error!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  if (textService.processedText != null)
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          setState(() {
                            textService.processedText = null;
                            textService.error = null;
                          });
                        },
                        child: const Text('Nový Text'),
                      ),
                    ),
                  if (textService.processedText == null)
                    Expanded(
                      child: ElevatedButton(
                        onPressed: textService.isLoading 
                          ? null 
                          : () => textService.processText(_textController.text),
                        child: const Text('Zpracovat Text'),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}