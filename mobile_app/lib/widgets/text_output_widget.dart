import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/text_processing_service.dart';
import 'package:flutter/services.dart';

class TextOutputWidget extends StatelessWidget {
  const TextOutputWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final textService = Provider.of<TextProcessingService>(context);
    
    if (textService.processedText == null) {
      return const Center(
        child: Text('Zatím nebyl zpracován žádný text.'),
      );
    }
    
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Zpracovaný text',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.copy),
                tooltip: 'Kopírovat do schránky',
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: textService.processedText!));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Text zkopírován do schránky'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16.0, 0, 16.0, 16.0),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: SingleChildScrollView(
                child: SelectableText(textService.processedText!),
              ),
            ),
          ),
        ),
      ],
    );
  }
}